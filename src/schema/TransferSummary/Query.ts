/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { arg, extendType, inputObjectType, intArg } from 'nexus';

// const TransferSummaryFilter = inputObjectType({
//   name: 'TransferSummaryFilter',
//   definition(t) {
//     t.field('startDate', { type: 'DateTimeFlexible' });
//     t.field('endDate', { type: 'DateTimeFlexible' });
//     t.field('errorCode', { type: 'Int' });
//     t.field('payerDFSP', { type: 'String' });
//     t.field('payeeDFSP', { type: 'String' });
//     t.field('currency', { type: 'Currency' });
//   },
// });


const TransferSummaryFilter = inputObjectType({
  name: 'TransferSummaryFilter',
  definition(t) {
    t.field('startDate', { type: 'DateTimeFlexible' });
    t.field('endDate', { type: 'DateTimeFlexible' });
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
      resolve: async (parent, args, ctx) => {
        try {
          const { limit = 10, offset = 0 } = args;
          console.log('Resolving transferSummary query');
          const aggregateResult = await ctx.transaction.transaction.groupBy({
            by: ['sourceCurrency', 'targetCurrency'],
            _count: {
              transferId: true,
            },
            _sum: {
              sourceAmount: true,
              targetAmount: true,
            },
            skip: offset ?? 0,
            take: limit ?? 5,
            orderBy: {
              sourceCurrency: 'asc',
            },
          });

          const transfersSummary = aggregateResult.map((group) => ({
            sourceCurrency: group.sourceCurrency,
            targetCurrency: group.targetCurrency,
            count: group._count.transferId,
            sourceAmount: group._sum.sourceAmount || 0,
            targetAmount: group._sum.targetAmount || 0,
          }));

          if (transfersSummary.length === 0) {
            console.log('No transfers found');
          } else {
            console.log('TransferSummary is: ', transfersSummary);
          }
          return transfersSummary;
        } catch (error) {
          console.error('Error fetching transfers', error);
          throw new Error('Error fetching transfers data');
        }
      },
    });
  },
});

export default [Query, TransferSummaryFilter];
