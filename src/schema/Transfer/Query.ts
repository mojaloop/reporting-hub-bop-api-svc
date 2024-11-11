/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { extendType, intArg, nonNull, stringArg } from 'nexus';
const Query = extendType({
  type: 'Query',
  definition(t) {
    t.field('transfers', {
      type: 'Transfer',
      args: {
        transferId: nonNull(stringArg()),
      },
      resolve: async (parent, args, ctx) => {
        try {
          const transaction = await ctx.transaction.transaction.findUnique({
            where: {
              transferId: args.transferId,
            },
          });

          if (!transaction) {
            console.log(`No transaction found for transferId: ${args.transferId}`);
            return null;
          }

          return transaction;
        } catch (error) {
          console.error(`Error fetching transaction with transferId: ${args.transferId}`, error);
          throw new Error('Error fetching transaction data');
        }
      },
    });

    t.nonNull.list.nonNull.field('getAllTransfers', {
      type: 'Transfer',
      args: {
        limit: intArg(),
        offset: intArg(),
      },
      resolve: async (parent, args, ctx) => {
        try {
          const { limit = 10, offset = 0 } = args;
          const transfers = await ctx.transaction.transaction.findMany({
            skip: offset ?? 0,
            take: limit ?? 5,
            orderBy: {
              createdAt: 'desc',
            },
          });

          if (transfers.length === 0) {
            console.log(`No transfers found with limit: ${limit} and offset: ${offset}`);
          }

          return transfers;
        } catch (error) {
          console.error('Error fetching transfers', error);
          throw new Error('Error fetching transfers data');
        }
      },
    });
  },
});

export default Query;
