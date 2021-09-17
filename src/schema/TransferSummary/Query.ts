import { arg, extendType } from 'nexus';
import { parse, simplify } from 'graphql-parse-resolve-info';

const Query = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('transferSummary', {
      type: 'TransferSummary',
      args: {
        filter: arg({ type: 'TransferFilter' }),
      },
      resolve: async (parent, args, ctx, info) => {
        const parsedInfo = parse(info);
        const simplifiedInfo = simplify(parsedInfo as any, info.returnType);
        const { fields }: any = simplifiedInfo;

        return ctx.centralLedger.$queryRawUnsafe(`
          SELECT
            COUNT(tF.transferId) as count,
            SUM(t.amount) as amount,
            CASE WHEN ${!!fields.payer} THEN pPayer.name ELSE NULL END AS payer,
            CASE WHEN ${!!fields.payee} THEN pPayee.name ELSE NULL END AS payee,
            CASE WHEN ${!!fields.currency} THEN c.currencyId ELSE NULL END AS currency
        FROM
            transferFulfilment tF
            INNER JOIN transfer t ON t.transferId = tF.transferId
            INNER JOIN transferParticipant tPPayer ON tPPayer.transferId = tF.transferId
                AND tPPayer.transferParticipantRoleTypeId = (SELECT transferParticipantRoleTypeId from transferParticipantRoleType WHERE name = 'PAYER_DFSP')
                INNER JOIN participantCurrency pCPayer ON pCPayer.participantCurrencyId = tPPayer.participantCurrencyId
                INNER JOIN participant pPayer ON pPayer.participantId = pCPayer.participantId
            INNER JOIN transferParticipant tPPayee ON tPPayee.transferId = tF.transferId
                AND tPPayee.transferParticipantRoleTypeId = (SELECT transferParticipantRoleTypeId from transferParticipantRoleType WHERE name = 'PAYEE_DFSP')
                INNER JOIN participantCurrency pCPayee ON pCPayee.participantCurrencyId = tPPayee.participantCurrencyId
                INNER JOIN participant pPayee ON pPayee.participantId = pCPayee.participantId
            INNER JOIN settlementWindow sW on sW.settlementWindowId = tF.settlementWindowId
            INNER JOIN settlementSettlementWindow sSW on tF.settlementWindowId = sSW.settlementWindowId
            INNER JOIN settlementWindowStateChange sWSC on sW.currentStateChangeId = sWSC.settlementWindowStateChangeId
            INNER JOIN settlement s on sSW.settlementId = s.settlementId
            INNER JOIN settlementModel sM ON sM.settlementModelId = s.settlementModelId
            INNER JOIN currency c ON c.currencyId = sM.currencyId
        WHERE
            tF.isValid
        GROUP BY
            CASE WHEN ${!!fields.payer} THEN pPayer.name ELSE NULL END,
            CASE WHEN ${!!fields.payee} THEN pPayee.name ELSE NULL END,
            CASE WHEN ${!!fields.currency} THEN c.currencyId ELSE NULL END
            `);
      },
    });
  },
});

export default [Query];
