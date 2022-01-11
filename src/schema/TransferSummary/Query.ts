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
    t.field('currency', { type: 'Currency' });
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

        return ctx.centralLedger.$queryRawUnsafe(`
          SELECT
            COUNT(t.transferId) as count,
            SUM(t.amount) as amount,
            IF(${!!fields.payerDFSP}, pPayer.name, NULL) AS payerDFSP,
            IF(${!!fields.payeeDFSP}, pPayee.name, NULL) AS payeeDFSP,
            IF(${!!fields.currency}, c.currencyId, NULL) AS currency,
            IF(${!!fields.errorCode}, tE.errorCode, NULL) AS errorCode
        FROM
            transfer t
            LEFT JOIN transferFulfilment tF ON t.transferId = tF.transferId
            LEFT JOIN transferParticipant tPPayer ON tPPayer.transferId = t.transferId
                AND tPPayer.transferParticipantRoleTypeId = (SELECT transferParticipantRoleTypeId from transferParticipantRoleType WHERE name = 'PAYER_DFSP')
                JOIN participantCurrency pCPayer ON pCPayer.participantCurrencyId = tPPayer.participantCurrencyId
                JOIN participant pPayer ON pPayer.participantId = pCPayer.participantId
            LEFT JOIN transferParticipant tPPayee ON tPPayee.transferId = t.transferId
                AND tPPayee.transferParticipantRoleTypeId = (SELECT transferParticipantRoleTypeId from transferParticipantRoleType WHERE name = 'PAYEE_DFSP')
                JOIN participantCurrency pCPayee ON pCPayee.participantCurrencyId = tPPayee.participantCurrencyId
                JOIN participant pPayee ON pPayee.participantId = pCPayee.participantId
            LEFT JOIN currency c on t.currencyId = c.currencyId
            LEFT JOIN transferError tE on t.transferId = tE.transferId
        WHERE TRUE
            AND IF(${!!args.filter?.startDate}, t.createdDate >= '${args.filter?.startDate}', TRUE)
            AND IF(${!!args.filter?.endDate}, t.createdDate < '${args.filter?.endDate}', TRUE)
            AND IF(${!!args.filter?.payerDFSP}, pPayer.name = '${args.filter?.payerDFSP}', TRUE)
            AND IF(${!!args.filter?.payeeDFSP}, pPayee.name = '${args.filter?.payerDFSP}', TRUE)
            AND IF(${!!args.filter?.currency}, c.currencyId = '${args.filter?.currency}', TRUE)
            AND IF(${!!args.filter?.errorCode}, tE.errorCode = '${args.filter?.errorCode}', TRUE)
        GROUP BY
            IF(${!!fields.payerDFSP}, pPayer.name, NULL),
            IF(${!!fields.payeeDFSP}, pPayee.name, NULL),
            IF(${!!fields.currency}, c.currencyId, NULL),
            IF(${!!fields.errorCode}, tE.errorCode, NULL)
        LIMIT ${args.limit || 100}
        OFFSET ${args.offset || 0}
        `);
      },
    });
  },
});

export default [Query, TransferSummaryFilter];
