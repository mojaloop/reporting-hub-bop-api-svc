/* eslint-disable @typescript-eslint/no-use-before-define */
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
import { NexusGenObjects } from 'nexus-typegen';

const TransferSummaryFilter = inputObjectType({
  name: 'TransferSummaryFilter',
  definition(t) {
    t.field('startDate', { type: 'DateTimeFlexible' });
    t.field('endDate', { type: 'DateTimeFlexible' });
    t.field('errorCode', { type: 'Int' });
    t.field('payerDFSP', { type: 'String' });
    t.field('payeeDFSP', { type: 'String' });
    t.field('targetCurrency', { type: 'String' });
    t.field('sourceCurrency', { type: 'String' });
  },
});

const Query = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('transferSummary', {
      type: 'TransferSummary',
      args: {
        filter: arg({ type: 'TransferSummaryFilter' }),
        limit: intArg(),
        offset: intArg(),
      },
      resolve: async (parent, args, ctx, info) => {
        const fields = ctx.getRequestFields(info) as NexusGenObjects['TransferSummary'];

        // Build pipeline stages
        const pipeline = [
          // Joins
          {
            $lookup: {
              from: 'transferFulfilment',
              localField: 'transferId',
              foreignField: 'transferId',
              as: 'fulfilment',
            },
          },
          {
            $lookup: {
              from: 'transferParticipant',
              let: { transferId: '$transferId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$transferId', '$$transferId'] },
                        { $eq: ['$transferParticipantRoleTypeId', 'PAYER_DFSP'] },
                      ],
                    },
                  },
                },
                {
                  $lookup: {
                    from: 'participant',
                    localField: 'participantId',
                    foreignField: 'participantId',
                    as: 'participant',
                  },
                },
                { $unwind: '$participant' },
              ],
              as: 'payerParticipant',
            },
          },
          {
            $lookup: {
              from: 'transferParticipant',
              let: { transferId: '$transferId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$transferId', '$$transferId'] },
                        { $eq: ['$transferParticipantRoleTypeId', 'PAYEE_DFSP'] },
                      ],
                    },
                  },
                },
                {
                  $lookup: {
                    from: 'participant',
                    localField: 'participantId',
                    foreignField: 'participantId',
                    as: 'participant',
                  },
                },
                { $unwind: '$participant' },
              ],
              as: 'payeeParticipant',
            },
          },
          {
            $lookup: {
              from: 'sourceCurrency',
              localField: 'currencyId',
              foreignField: 'currencyId',
              as: 'sourceCurrency',
            },
          },
          {
            $lookup: {
              from: 'targetCurrency',
              localField: 'currencyId',
              foreignField: 'currencyId',
              as: 'targetCurrency',
            },
          },
          {
            $lookup: {
              from: 'transferError',
              localField: 'transferId',
              foreignField: 'transferId',
              as: 'error',
            },
          },
          { $unwind: { path: '$payerParticipant', preserveNullAndEmptyArrays: true } },
          { $unwind: { path: '$payeeParticipant', preserveNullAndEmptyArrays: true } },
          { $unwind: { path: '$sourceCurrency', preserveNullAndEmptyArrays: true } },
          { $unwind: { path: '$targetCurrency', preserveNullAndEmptyArrays: true } },
          { $unwind: { path: '$error', preserveNullAndEmptyArrays: true } },

          // Match conditions
          {
            $match: {
              $and: [...buildMatchConditions(args.filter)],
            },
          },

          // Group
          {
            $group: {
              _id: buildGroupId(fields),
              count: { $sum: 1 },
              amount: { $sum: '$amount' },
              payerDFSP: {
                $first: fields.payerDFSP ? '$payerParticipant.participant.name' : null,
              },
              payeeDFSP: {
                $first: fields.payeeDFSP ? '$payeeParticipant.participant.name' : null,
              },
              sourceCurrency: {
                $first: fields.sourceCurrency ? '$sourceCurrency.currencyId' : null,
              },
              targetCurrency: {
                $first: fields.targetCurrency ? '$targetCurrency.currencyId' : null,
              },
              errorCode: {
                $first: fields.errorCode ? '$error.errorCode' : null,
              },
            },
          },

          // Pagination
          { $skip: args.offset || 0 },
          { $limit: args.limit || 100 },
        ];

        return ctx.db.collection('transfer').aggregate(pipeline).toArray();
      },
    });
  },
});

function buildMatchConditions(filter: any): Record<string, any>[] {
  const conditions: Record<string, any>[] = [];

  if (filter?.startDate) {
    conditions.push({ createdDate: { $gte: new Date(filter.startDate) } });
  }

  if (filter?.endDate) {
    conditions.push({ createdDate: { $lt: new Date(filter.endDate) } });
  }

  if (filter?.payerDFSP) {
    conditions.push({
      'payerParticipant.participant.name': filter.payerDFSP,
    });
  }

  if (filter?.payeeDFSP) {
    conditions.push({
      'payeeParticipant.participant.name': filter.payeeDFSP,
    });
  }

  if (filter?.sourceCurrency) {
    conditions.push({
      'sourceCurrency.currencyId': filter.sourceCurrency,
    });
  }

  if (filter?.targetCurrency) {
    conditions.push({
      'targetCurrency.currencyId': filter.targetCurrency,
    });
  }

  if (filter?.errorCode) {
    conditions.push({
      'error.errorCode': filter.errorCode,
    });
  }

  return conditions.length ? conditions : [{}];
}

function buildGroupId(fields: any): Record<string, string> {
  return {
    ...(fields.payerDFSP && {
      payerDFSP: '$payerParticipant.participant.name',
    }),
    ...(fields.payeeDFSP && {
      payeeDFSP: '$payeeParticipant.participant.name',
    }),
    ...(fields.sourceCurrency && {
      sourceCurrency: '$sourceCurrency.currencyId',
    }),
    ...(fields.targetCurrency && {
      targetCurrency: '$targetCurrency.currencyId',
    }),
    ...(fields.errorCode && {
      errorCode: '$error.errorCode',
    }),
  };
}

export default [Query, TransferSummaryFilter];
