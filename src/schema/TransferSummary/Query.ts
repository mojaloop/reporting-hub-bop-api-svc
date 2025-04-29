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
        const groupByFields = groupBy && groupBy.length > 0 ? groupBy : null;

        let aggregateResult;

        try {
          if (!groupByFields) {
            // Aggregate results without grouping when no group by fields are provided
            aggregateResult = await ctx.transaction.aggregate([
              { $match: whereCondition },
              { $skip: offset ?? 0 },
              { $limit: limit ?? 100 },
              {
              $group: {
                _id: null,
                _count: { $sum: 1 },
                _sumSourceAmount: { $sum: '$sourceAmount' },
                _sumTargetAmount: { $sum: '$targetAmount' },
              },
              },
            ]).toArray();

            aggregateResult = {
              _count: { transferId: aggregateResult[0]?._count || 0 },
              _sum: {
              sourceAmount: aggregateResult[0]?._sumSourceAmount || 0,
              targetAmount: aggregateResult[0]?._sumTargetAmount || 0,
              },
            };
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

            const timeFilter = {
              createdAt: {
              ...(filter?.startDate && { $gte: new Date(filter.startDate) }),
              ...(filter?.endDate && { $lte: new Date(filter.endDate) }),
              },
            };
            // Aggregate results with grouping when group by fields are provided
            aggregateResult = await ctx.transaction.aggregate([
              {
                $match: {
                  ...timeFilter
                },
              },
              {
              $group: {
                _id: groupByFields.reduce((acc, field) => {
                if (field) {
                  acc[field] = `$${field}`;
                }
                return acc;
                }, {}),
                _count: { $sum: 1 },
                _sumSourceAmount: { $sum: '$sourceAmount' },
                _sumTargetAmount: { $sum: '$targetAmount' },
              },
              },
              { $sort: { _count: -1 } },
              { $skip: offset ?? 0 },
              { $limit: limit ?? 100 },
            ]).toArray();
            const transfersSummary = aggregateResult.map((group) => ({
              group: {
                errorCode: group._id.errorCode || null,
                sourceCurrency: group._id.sourceCurrency || null,
                targetCurrency: group._id.targetCurrency || null,
                payerDFSP: group._id.payerDFSP || null,
                payeeDFSP: group._id.payeeDFSP || null,
              },
              count: group._count || 0,
              sum: {
                sourceAmount: group._sumSourceAmount || 0,
                targetAmount: group._sumTargetAmount || 0,
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
