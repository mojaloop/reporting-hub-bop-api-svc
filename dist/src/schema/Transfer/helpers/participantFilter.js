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
exports.createParticipantFilter = void 0;
const createParticipantFilter = (payeeDFSPs, payerDFSPs) => {
    const payeeFilter = {
        transferParticipantRoleType: {
            name: 'PAYEE_DFSP',
        },
    };
    const payerFilter = {
        transferParticipantRoleType: {
            name: 'PAYER_DFSP',
        },
    };
    if (payeeDFSPs) {
        payeeFilter.participantCurrency = {
            participant: {
                name: {
                    in: payeeDFSPs,
                },
            },
        };
    }
    if (payerDFSPs) {
        payerFilter.participantCurrency = {
            participant: {
                name: {
                    in: payerDFSPs,
                },
            },
        };
    }
    return [payerFilter, payeeFilter];
};
exports.createParticipantFilter = createParticipantFilter;
//# sourceMappingURL=participantFilter.js.map