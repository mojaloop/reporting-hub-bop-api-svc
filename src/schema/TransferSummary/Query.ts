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
import { createWhereCondition } from './helpers/TransferSummaryFilter';

const SortOrder = {
  DESCENDING: -1,
} as const;

const FIELD_PATH_PREFIX = '$';

const SummedField = {
  SOURCE_AMOUNT: 'sourceAmount',
  TARGET_AMOUNT: 'targetAmount',
} as const;

const DEFAULT_SUMMARY_LIMIT = 100;
const DEFAULT_SUMMARY_OFFSET = 0;

const fieldPath = (field: string) => `${FIELD_PATH_PREFIX}${field}`;

const TransferSummaryFilter = inputObjectType({
  name: 'TransferSummaryFilter',
  definition(t) {
    t.dateTimeFlex('startDate');
    t.dateTimeFlex('endDate');
  },
});

const toSummary = (group: any) => ({
  group: {
    errorCode: group._id?.errorCode || null,
    sourceCurrency: group._id?.sourceCurrency || null,
    targetCurrency: group._id?.targetCurrency || null,
    payerDFSP: group._id?.payerDFSP || null,
    payeeDFSP: group._id?.payeeDFSP || null,
  },
  count: group._count || 0,
  sum: {
    sourceAmount: group._sumSourceAmount || 0,
    targetAmount: group._sumTargetAmount || 0,
  },
});

const NO_TRANSFERS = { _id: null };

const groupKey = (groupByFields: (string | null)[]) =>
  groupByFields.reduce<Record<string, string>>((acc, field) => {
    if (field) {
      acc[field] = fieldPath(field);
    }
    return acc;
  }, {});

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
        const limit = args.limit ?? DEFAULT_SUMMARY_LIMIT;
        const offset = args.offset ?? DEFAULT_SUMMARY_OFFSET;
        const groupBy = args.groupBy ?? [];

        try {
          const groups = await ctx.transaction
            .aggregate([
              { $match: createWhereCondition(args.filter) },
              {
                $group: {
                  _id: groupBy.length ? groupKey(groupBy) : null,
                  _count: { $sum: 1 },
                  _sumSourceAmount: { $sum: fieldPath(SummedField.SOURCE_AMOUNT) },
                  _sumTargetAmount: { $sum: fieldPath(SummedField.TARGET_AMOUNT) },
                },
              },
              { $sort: { _count: SortOrder.DESCENDING } },
              { $skip: offset },
              { $limit: limit },
            ])
            .toArray();

          if (!groupBy.length && !groups.length) {
            return [toSummary(NO_TRANSFERS)];
          }
          return groups.map(toSummary);
        } catch (error) {
          console.error('Error fetching transfers:', error);
          throw new Error('Error fetching transfers data');
        }
      },
    });
  },
});

export default [Query, TransferSummaryFilter];
