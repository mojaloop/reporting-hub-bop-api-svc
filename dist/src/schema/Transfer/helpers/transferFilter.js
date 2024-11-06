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
exports.createTransferFilter = void 0;
const _1 = require(".");
const _2 = require(".");
const createTransferFilter = (participants, filter) => {
    let payeeDFSPs;
    let payerDFSPs;
    if (participants) {
        payeeDFSPs = payerDFSPs = participants || [];
    }
    if (participants && filter?.payer?.dfsp) {
        payerDFSPs = participants?.includes(filter.payer.dfsp) ? [filter.payer.dfsp] : [];
    }
    else if (filter?.payer?.dfsp) {
        payerDFSPs = [filter.payer.dfsp];
    }
    if (participants && filter?.payee?.dfsp) {
        payeeDFSPs = participants?.includes(filter.payee.dfsp) ? [filter.payee.dfsp] : [];
    }
    else if (filter?.payee?.dfsp) {
        payeeDFSPs = [filter.payee.dfsp];
    }
    const transferFilter = {};
    transferFilter.createdDate = {
        gte: filter?.startDate || undefined,
        lt: filter?.endDate || undefined,
    };
    if (filter?.errorCode) {
        transferFilter.transferError = {
            some: {
                errorCode: filter?.errorCode || undefined,
            },
        };
    }
    if (filter?.transferState) {
        transferFilter.transferStateChange = {
            some: {
                transferState: {
                    enumeration: filter?.transferState,
                },
            },
        };
    }
    if (filter?.settlementWindowId || filter?.settlementId) {
        const settlementFilter = {};
        if (filter?.settlementId) {
            settlementFilter.settlementWindow = {
                settlementSettlementWindow: {
                    some: {
                        settlementId: filter?.settlementId,
                    },
                },
            };
        }
        if (filter?.settlementWindowId) {
            settlementFilter.settlementWindowId = filter?.settlementWindowId;
        }
        transferFilter.transferFulfilment = {
            some: settlementFilter,
        };
    }
    if (filter?.currency) {
        transferFilter.currency = {
            currencyId: filter?.currency,
        };
    }
    if (filter?.payee?.idType || filter?.payee?.idValue || filter?.payer?.idType || filter?.payer?.idValue) {
        transferFilter.quote = {
            some: {
                quoteParty: {
                    every: {
                        OR: (0, _1.createPartyFilter)(filter?.payee, filter?.payer),
                    },
                },
            },
        };
    }
    transferFilter.transferParticipant = {
        every: {
            OR: (0, _2.createParticipantFilter)(payeeDFSPs, payerDFSPs),
        },
    };
    return transferFilter;
};
exports.createTransferFilter = createTransferFilter;
//# sourceMappingURL=transferFilter.js.map