/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { extendType, intArg, nonNull, stringArg, inputObjectType } from 'nexus';
import { createWhereCondition } from './helpers/TransferFilter';

const SortOrder = {
  DESCENDING: -1,
} as const;

const DEFAULT_TRANSFERS_LIMIT = 20;
const DEFAULT_TRANSFERS_OFFSET = 0;

const PartyFilter = inputObjectType({
  name: 'PartyFilter',
  definition(t) {
    t.string('partyIdType');
    t.string('partyIdentifier');
  },
});

const TransferFilter = inputObjectType({
  name: 'TransferFilter',
  definition(t) {
    t.nonNull.dateTimeFlex('startDate');
    t.nonNull.dateTimeFlex('endDate');
    t.field('payer', { type: PartyFilter });
    t.field('payee', { type: PartyFilter });
    t.string('payerDFSP');
    t.string('payeeDFSP');
    t.string('sourceCurrency');
    t.string('targetCurrency');
    t.string('transferState');
    t.string('conversionState');
    t.string('transactionType');
  },
});

const Query = extendType({
  type: 'Query',
  definition(t) {
    t.field('transfer', {
      type: 'Transfer',
      args: {
        transferId: nonNull(stringArg()),
      },
      resolve: async (_, args, ctx): Promise<any> => {
        try {
          const transaction = await ctx.transaction.findOne({
            transferId: args.transferId,
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
    t.nonNull.list.nonNull.field('transfers', {
      type: 'Transfer',
      args: {
        filter: TransferFilter,
        limit: intArg(),
        offset: intArg(),
      },
      resolve: async (_, args, ctx): Promise<any> => {
        try {
          const limit = args.limit ?? DEFAULT_TRANSFERS_LIMIT;
          const offset = args.offset ?? DEFAULT_TRANSFERS_OFFSET;
          const filter = args.filter ?? {};
          const whereCondition = createWhereCondition(filter);
          const transfers = await ctx.transaction
            .find(whereCondition)
            .sort({ createdAt: SortOrder.DESCENDING })
            .skip(offset)
            .limit(limit)
            .toArray();

          if (transfers.length === 0) {
            console.log(
              `No transfers found with limit: ${limit}, offset: ${offset}, and filter: ${JSON.stringify(filter)}`
            );
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

export default [Query, PartyFilter, TransferFilter];
