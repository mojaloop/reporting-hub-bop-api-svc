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

// Define input type for TransferSummaryFilter
const TransferSummaryFilter = inputObjectType({
  name: 'TransferSummaryFilter',
  definition(t) {
    t.dateTimeFlex('startDate');
    t.dateTimeFlex('endDate');
  },
});

// Create where condition for filtering
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
    // Define a field to fetch transfer summaries
    t.nonNull.list.field('transferSummary', {
      type: 'TransferSummary',
      args: {
        limit: intArg(),
        offset: intArg(),
        filter: TransferSummaryFilter,
        groupBy: list(stringArg()),
      },
      resolve: async (parent, args, ctx) => {
        const { limit = 100, offset = 0, filter = {}, groupBy = [] } = args;
        const whereCondition = createWhereCondition(filter);

        const groupByFields = groupBy && groupBy.length > 0 ? groupBy : null;

        let aggregateResult;

        try {
          if (!groupByFields) {
            // Aggregate results without grouping when no group by fields are provided
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
            // Aggregate results with grouping when group by fields are provided
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
                errorCode: group.errorCode || null,
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
            return transfersSummary;
          }
        } catch (error) {
          console.error('Error fetching transfers:', error);
          throw new Error('Error fetching transfers data');
        } finally {
          aggregateResult = null;
        }
      },
    });
  },
});

export default [Query, TransferSummaryFilter];
