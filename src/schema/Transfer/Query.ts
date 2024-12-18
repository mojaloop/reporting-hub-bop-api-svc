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

// Define input type for PartyFilter
const PartyFilter = inputObjectType({
  name: 'PartyFilter',
  definition(t) {
    t.string('partyIdType');
    t.string('partyIdentifier');
  },
});

// Define input type for TransferFilter
const TransferFilter = inputObjectType({
  name: 'TransferFilter',
  definition(t) {
    t.nonNull.dateTimeFlex('startDate');
    t.nonNull.dateTimeFlex('endDate');
    t.field('payer', { type: 'PartyFilter' });
    t.field('payee', { type: 'PartyFilter' });
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
    // Define a field to fetch a single transfer by ID
    t.field('transfer', {
      type: 'Transfer',
      args: {
        transferId: nonNull(stringArg()),
      },
      resolve: async (_, args, ctx): Promise<any> => {
        try {
          // Fetch a single transaction by transferId
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
    // Define a field to fetch multiple transfers with filters, limit, and offset
    t.nonNull.list.nonNull.field('transfers', {
      type: 'Transfer',
      args: {
        filter: TransferFilter,
        limit: intArg(),
        offset: intArg(),
      },
      resolve: async (_, args, ctx): Promise<any> => {
        try {
          const { limit = 20, offset = 0, filter = {} } = args;
          // Create where condition based on filter
          const whereCondition = createWhereCondition(filter);
          // Fetch multiple transactions with pagination and filtering
          const transfers = await ctx.transaction.transaction.findMany({
            skip: offset ?? 0,
            take: limit ?? 100,
            orderBy: {
              createdAt: 'desc',
            },
            where: whereCondition,
          });

          if (transfers.length === 0) {
            console.log(
              `No transfers found with limit: ${limit}, offset: ${offset}, and filter: ${JSON.stringify(filter)}`
            );
          }
          // console.log('Transfer data fetched is : ', transfers);
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
