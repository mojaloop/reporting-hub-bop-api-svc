/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { arg, extendType, inputObjectType, intArg, enumType } from 'nexus';

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

const TransactionScalarFieldEnum = enumType({
  name: 'TransactionScalarFieldEnum',
  members: [
    'id',
    'transferId',
    'transactionId',
    'sourceAmount',
    'sourceCurrency',
    'targetAmount',
    'targetCurrency',
    'transferState',
    'transactionType',
    'errorCode',
    'transferSettlementWindowId',
    'payerDFSP',
    'payerDFSPProxy',
    'payeeDFSP',
    'payeeDFSPProxy',
    'createdAt',
    'lastUpdated',
  ],
});


// Helper function to create where condition
const createWhereCondition = (filter) => {
  console.log("Creating where condition with filter:", filter);
  const whereCondition: any = { createdAt: {} };

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

  // Apply other filters
  if (filter?.errorCode !== undefined) {
    whereCondition.errorCode = filter.errorCode;
  }
  if (filter?.payerDFSP) {
    whereCondition.payerDFSP = filter.payerDFSP;
  }
  if (filter?.payeeDFSP) {
    whereCondition.payeeDFSP = filter.payeeDFSP;
  }
  if (filter?.sourceCurrency) {
    whereCondition.sourceCurrency = filter.sourceCurrency;
  }
  if (filter?.targetCurrency) {
    whereCondition.targetCurrency = filter.targetCurrency;
  }

  return whereCondition;
};

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
      resolve: async (parent, args, ctx): Promise<{ count: number; sourceCurrency: string; targetCurrency: string; payerDFSP: string; payeeDFSP: string; errorCode: number | null; sourceAmount: number; targetAmount: number; }[]> => {
        try {
          const { limit = 10, offset = 0, filter = {} } = args;
          console.log('Resolving transferSummary query');
          console.log('Received filter:', filter);

          const whereCondition = createWhereCondition(filter);
          console.log('Generated whereCondition:', whereCondition);
          
          const groupByCondition: string[] = [];
          if (filter?.sourceCurrency) groupByCondition.push('sourceCurrency');
          if (filter?.targetCurrency) groupByCondition.push('targetCurrency');
          if (filter?.payerDFSP) groupByCondition.push('payerDFSP');
          if (filter?.payeeDFSP) groupByCondition.push('payeeDFSP');
          if (filter?.errorCode) groupByCondition.push('errorCode');

          console.log('Generated groupByCondition:', groupByCondition);
          if (groupByCondition.length === 0) {
            const aggregateResult = await ctx.transaction.transaction.aggregate({
              _count: { transferId: true },
              _sum: { sourceAmount: true, targetAmount: true },
              where: whereCondition,
            });
            return [{
              sourceCurrency: null as any,
              targetCurrency: null as any,
              payerDFSP: null as any,
              payeeDFSP: null as any,
              errorCode: null as any,
              count: aggregateResult._count.transferId ?? 0,
              sourceAmount: aggregateResult._sum.sourceAmount || 0,
              targetAmount: aggregateResult._sum.targetAmount || 0,
            }];
          } else {
            const aggregateResult = await ctx.transaction.transaction.groupBy({
              by: groupByCondition ,
              _count: { transferId: true },
              _sum: { sourceAmount: true, targetAmount: true },
              where: whereCondition,
              skip: offset ?? 0,
              take: limit ?? 10,
              orderBy: {
                sourceCurrency: 'asc',
              },
            });

            const transfersSummary = aggregateResult.map((group) => ({
              sourceCurrency: group.sourceCurrency || '',
              targetCurrency: group.targetCurrency || '',
              payerDFSP: group.payerDFSP || '',
              payeeDFSP: group.payeeDFSP || '',
              errorCode: group.errorCode || null,
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
