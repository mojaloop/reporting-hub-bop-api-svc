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
const helpers_1 = require("./helpers");
const PartyFilter = (0, nexus_1.inputObjectType)({
    name: 'PartyFilter',
    definition(t) {
        t.field('dfsp', { type: 'String' });
        t.field('idType', { type: 'PartyIDType' });
        t.field('idValue', { type: 'String' });
    },
});
const TransferFilter = (0, nexus_1.inputObjectType)({
    name: 'TransferFilter',
    definition(t) {
        t.nonNull.field('startDate', { type: 'DateTimeFlexible' });
        t.nonNull.field('endDate', { type: 'DateTimeFlexible' });
        t.field('errorCode', { type: 'Int' });
        t.field('payer', { type: 'PartyFilter' });
        t.field('payee', { type: 'PartyFilter' });
        t.field('sourceCurrency', { type: 'Currency' });
        t.field('targetCurrency', { type: 'Currency' });
        t.field('transferState', { type: 'TransferState' });
        t.field('settlementWindowId', { type: 'Int' });
        t.field('settlementId', { type: 'Int' });
    },
});
const Query = (0, nexus_1.extendType)({
    type: 'Query',
    definition(t) {
        t.field('transfer', {
            type: 'Transfer',
            args: {
                transferId: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
            },
            resolve: async (parent, args, ctx) => {
                const tr = await ctx.eventStore.transaction.findUnique({
                    where: {
                        transferId: args.transferId,
                    },
                });
                if (!tr) {
                    return null;
                }
                return {
                    transactionId: tr.transactionId,
                    targetAmount: tr.targetAmount.toNumber(),
                    sourceAmount: tr.sourceAmount.toNumber(),
                    targetCurrency: tr.targetCurrencyId,
                    sourceCurrency: tr.sourceCurrencyId,
                    createdAt: tr.createdDate.toISOString(),
                    ilpCondition: tr.ilpCondition,
                };
            },
        });
        t.nonNull.list.nonNull.field('transfers', {
            type: 'Transfer',
            args: {
                filter: (0, nexus_1.arg)({ type: (0, nexus_1.nonNull)('TransferFilter') }),
                limit: (0, nexus_1.intArg)(),
                offset: (0, nexus_1.intArg)(),
            },
            resolve: async (parent, args, ctx) => {
                const transferFilter = (0, helpers_1.createTransferFilter)(ctx.participants, args.filter);
                const transfers = await ctx.eventStore.transaction.findMany({
                    take: args.limit ?? 100,
                    skip: args.offset || undefined,
                    orderBy: [{ createdDate: 'desc' }],
                    where: transferFilter,
                });
                return transfers.map((tr) => ({
                    transferId: tr.transferId,
                    amount: tr.amount.toNumber(),
                    currency: tr.currencyId,
                    createdAt: tr.createdDate.toISOString(),
                    ilpCondition: tr.ilpCondition,
                }));
            },
        });
    },
});
exports.default = [Query, TransferFilter, PartyFilter];
//# sourceMappingURL=Query.js.map