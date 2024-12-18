"use strict";
/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
const nexus_1 = require("nexus");
const dataloaders_1 = require("./dataloaders");
const TransferError_1 = require("@app/schema/Transfer/dataloaders/TransferError");
const TransferState = (0, nexus_1.enumType)({
    name: 'TransferState',
    members: ['ABORTED', 'COMMITTED', 'RESERVED', 'SETTLED'],
});
const TransactionType = (0, nexus_1.enumType)({
    name: 'TransactionType',
    members: ['TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND'],
});
const getEvents = async (ctx, transferId, eventType) => {
    const [settlement, quote] = await Promise.all([
        (0, dataloaders_1.getSettlementDataloader)(ctx).load(transferId),
        (0, dataloaders_1.getQuotesDataloader)(ctx).load(transferId),
    ]);
    return (0, dataloaders_1.getEventsDataloader)(ctx, eventType).load({
        transactionId: quote?.transactionReferenceId,
        settlementId: settlement?.settlementId?.toString(),
        settlementWindowId: settlement?.settlementWindowId?.toString(),
    });
};
const Transfer = (0, nexus_1.objectType)({
    name: 'Transfer',
    definition(t) {
        t.nonNull.string('transferId');
        t.field('transactionId', {
            type: 'String',
            resolve: async (parent, _, ctx) => {
                const quote = await (0, dataloaders_1.getQuotesDataloader)(ctx).load(parent.transferId);
                return quote?.transactionReferenceId;
            },
        });
        t.field('quoteId', {
            type: 'String',
            resolve: async (parent, _, ctx) => {
                const quote = await (0, dataloaders_1.getQuotesDataloader)(ctx).load(parent.transferId);
                return quote?.quoteId;
            },
        });
        t.decimal('amount');
        t.field('targetCurrency', {
            type: 'Currency',
        });
        t.field('sourceCurrency', {
            type: 'Currency',
            resolve: async (parent, _, ctx) => {
                const quote = await (0, dataloaders_1.getQuotesDataloader)(ctx).load(parent.transferId);
                return quote?.sourceCurrency;
            },
        });
        t.string('createdAt');
        t.field('transferState', {
            type: 'String',
            resolve: (parent, _, ctx) => {
                return (0, dataloaders_1.getTransferStateDataloader)(ctx).load(parent.transferId);
            },
        });
        t.field('transactionType', {
            type: 'String',
            resolve: async (parent, _, ctx) => {
                const quote = await (0, dataloaders_1.getQuotesDataloader)(ctx).load(parent.transferId);
                if (quote?.transactionScenarioId) {
                    const txType = await (0, dataloaders_1.getTransactionTypeDataloader)(ctx).load(quote.transactionScenarioId);
                    return txType.name;
                }
                return null;
            },
        });
        t.field('errorCode', {
            type: 'Int',
            resolve: (parent, _, ctx) => {
                return (0, TransferError_1.getTransferErrorDataloader)(ctx).load(parent.transferId);
            },
        });
        t.field('settlementWindowId', {
            type: 'BigInt',
            resolve: async (parent, _, ctx) => {
                const settlement = await (0, dataloaders_1.getSettlementDataloader)(ctx).load(parent.transferId);
                return settlement?.settlementWindowId;
            },
        });
        t.field('settlementId', {
            type: 'BigInt',
            resolve: async (parent, _, ctx) => {
                const settlement = await (0, dataloaders_1.getSettlementDataloader)(ctx).load(parent.transferId);
                return settlement?.settlementId;
            },
        });
        t.field('payerDFSP', {
            type: 'DFSP',
            resolve: (parent, _, ctx) => {
                return (0, dataloaders_1.getDFSPDataloader)(ctx, 'PAYER_DFSP').load(parent.transferId);
            },
        });
        t.field('payeeDFSP', {
            type: 'DFSP',
            resolve: (parent, _, ctx) => {
                return (0, dataloaders_1.getDFSPDataloader)(ctx, 'PAYEE_DFSP').load(parent.transferId);
            },
        });
        t.field('payerParty', {
            type: 'Party',
            resolve: (parent, _, ctx) => {
                return (0, dataloaders_1.getPartyDataloader)(ctx, 'PAYER').load(parent.transferId);
            },
        });
        t.field('payeeParty', {
            type: 'Party',
            resolve: async (parent, _, ctx) => {
                return (0, dataloaders_1.getPartyDataloader)(ctx, 'PAYEE').load(parent.transferId);
            },
        });
        t.list.jsonObject('partyLookupEvents', {
            resolve: async (parent, _, ctx) => {
                return getEvents(ctx, parent.transferId, 'PartyLookup');
            },
        });
        t.list.jsonObject('quoteEvents', {
            resolve: async (parent, _, ctx) => {
                return getEvents(ctx, parent.transferId, 'Quote');
            },
        });
        t.list.jsonObject('transferEvents', {
            resolve: async (parent, _, ctx) => {
                return getEvents(ctx, parent.transferId, 'Transfer');
            },
        });
        t.list.jsonObject('settlementEvents', {
            resolve: async (parent, _, ctx) => {
                return getEvents(ctx, parent.transferId, 'Settlement');
            },
        });
    },
});
exports.default = [Transfer, TransactionType, TransferState];
//# sourceMappingURL=Transfer.js.map