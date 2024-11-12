/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { extendType, inputObjectType, intArg } from 'nexus';
import { createWhereCondition, createGroupByCondition } from './helpers/TransferSummaryFilter';
const TransferSummaryFilter = inputObjectType({
  name: 'TransferSummaryFilter',
  definition(t) {
    t.field('startDate', { type: 'DateTimeFlexible' });
    t.field('endDate', { type: 'DateTimeFlexible' });
    t.field('errorCode', { type: 'Int' });
    t.field('payerDFSP', { type: 'String' });
    t.field('payeeDFSP', { type: 'String' });
    t.field('sourceCurrency', { type: 'String' });
    t.field('targetCurrency', { type: 'String' });
  },
});

const Query = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('transferSummary', {
      type: 'TransferSummary',
      args: {
        limit: intArg(),
        offset: intArg(),
        filter: TransferSummaryFilter,
      },
      resolve: async (
        parent,
        args,
        ctx
      ): Promise<
        {
          count: number;
          sourceCurrency: string | null;
          targetCurrency: string | null;
          payerDFSP: string | null;
          payeeDFSP: string | null;
          errorCode: number | null;
          sourceAmount: number;
          targetAmount: number;
        }[]
      > => {
        try {
          const { limit = 100, offset = 0, filter = {} } = args;

          const whereCondition = createWhereCondition(filter);
          const groupByCondition = createGroupByCondition(filter);

          if (groupByCondition.length === 0) {
            const aggregateResult = await ctx.transaction.transaction.aggregate({
              _count: { transferId: true },
              _sum: { sourceAmount: true, targetAmount: true },
              where: whereCondition,
            });
            return [
              {
                sourceCurrency: null as any,
                targetCurrency: null as any,
                payerDFSP: null as any,
                payeeDFSP: null as any,
                errorCode: null as any,
                count: aggregateResult._count.transferId ?? 0,
                sourceAmount: aggregateResult._sum.sourceAmount || 0,
                targetAmount: aggregateResult._sum.targetAmount || 0,
              },
            ];
          } else {
            const aggregateResult = await ctx.transaction.transaction.groupBy({
              by: groupByCondition,
              _count: { transferId: true },
              _sum: { sourceAmount: true, targetAmount: true },
              where: whereCondition,
              skip: offset ?? 0,
              take: limit ?? 100,
              orderBy: {
                _count: {
                  transferId: 'desc',
                },
              },
            });

            const transfersSummary = aggregateResult.map((group) => ({
              sourceCurrency: group.sourceCurrency || null,
              targetCurrency: group.targetCurrency || null,
              payerDFSP: group.payerDFSP || null,
              payeeDFSP: group.payeeDFSP || null,
              errorCode: group.errorCode !== undefined ? group.errorCode : null,
              count: typeof group._count === 'object' ? group._count.transferId ?? 0 : 0,
              sourceAmount: group._sum?.sourceAmount || 0,
              targetAmount: group._sum?.targetAmount || 0,
            }));

            if (transfersSummary.length === 0) {
              console.log('No transfers found');
            } else {
              console.log('TransferSummary is: ', transfersSummary);
            }
            return transfersSummary;
          }
        } catch (error) {
          console.error('Error fetching transfers:', error);
          throw new Error('Error fetching transfers data');
        }
      },
    });
  },
});

export default [Query, TransferSummaryFilter];
