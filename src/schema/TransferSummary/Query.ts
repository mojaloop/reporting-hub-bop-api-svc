/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { list, stringArg, extendType, intArg, inputObjectType } from 'nexus';

const TransferSummaryFilter = inputObjectType({
  name: 'TransferSummaryFilter',
  definition(t) {
    t.dateTimeFlex('startDate');
    t.dateTimeFlex('endDate');
  },
});

const createWhereCondition = (filter: any) => {
  const whereCondition: any = {};

  if (filter?.startDate) {
    whereCondition.createdAt = {
      gte: new Date(filter.startDate),
    };
  }

  if (filter?.endDate) {
    whereCondition.createdAt = {
      ...whereCondition.createdAt,
      lte: new Date(filter.endDate),
    };
  }

  return whereCondition;
};

const Query = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('transferSummary', {
      type: 'TransferSummary',
      args: {
        limit: intArg(),
        offset: intArg(),
        filter: TransferSummaryFilter,
        groupBy: list(stringArg()),
      },
      resolve: async (parent, args, ctx) => {
        try {
          const { limit = 100, offset = 0, filter = {}, groupBy = [] } = args;
          const whereCondition = createWhereCondition(filter);

          const groupByFields = groupBy && groupBy.length > 0 ? groupBy : null;
          console.log('Group By Fields: ', groupByFields);

          let aggregateResult;

          if (!groupByFields) {
            aggregateResult = await ctx.transaction.transaction.aggregate({
              _count: { transferId: true },
              _sum: { sourceAmount: true, targetAmount: true },
              where: whereCondition,
              skip: offset ?? 0,
              take: limit ?? 100,
            });
            return [
              {
                group: {
                  errorCode: null,
                  sourceCurrency: null,
                  targetCurrency: null,
                  payerDFSP: null,
                  payeeDFSP: null,
                },
                count: aggregateResult._count ? aggregateResult._count.transferId : 0,
                sum: {
                  sourceAmount: aggregateResult._sum?.sourceAmount || 0,
                  targetAmount: aggregateResult._sum?.targetAmount || 0,
                },
              },
            ];
          } else {
            aggregateResult = await ctx.transaction.transaction.groupBy({
              by: groupByFields as ('sourceCurrency' | 'targetCurrency' | 'payerDFSP' | 'payeeDFSP' | 'errorCode')[],
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
              group: {
                errorCode: group.errorCode,
                sourceCurrency: group.sourceCurrency || null,
                targetCurrency: group.targetCurrency || null,
                payerDFSP: group.payerDFSP || null,
                payeeDFSP: group.payeeDFSP || null,
              },
              count: typeof group._count === 'object' ? group._count.transferId ?? 0 : 0,
              sum: {
                sourceAmount: group._sum?.sourceAmount || 0,
                targetAmount: group._sum?.targetAmount || 0,
              },
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
