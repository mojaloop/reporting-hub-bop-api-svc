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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartyDataloader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const ID = (type) => Symbol.for(`PARTY_DL_${type}`);
const findParties = async (ctx, transferIds, type) => {
    const transfers = await ctx.centralLedger.transfer.findMany({
        where: {
            transferId: {
                in: transferIds,
            },
        },
        select: {
            transferId: true,
            quote: {
                select: {
                    quoteParty: {
                        select: {
                            partyIdentifierType: true,
                            partyIdentifierValue: true,
                            party: true,
                            partyType: true,
                        },
                    },
                },
            },
        },
    });
    return Object.fromEntries(transfers.map((t) => {
        // Search the quote for the party that matches that party type
        const qp = t.quote[0]?.quoteParty.find((item) => item.partyType.name === type);
        const p = qp?.party[0];
        return [
            t.transferId,
            {
                id: p?.partyId,
                firstName: p?.firstName,
                lastName: p?.lastName,
                middleName: p?.middleName,
                dateOfBirth: p?.dateOfBirth,
                idType: qp?.partyIdentifierType?.name,
                idValue: qp?.partyIdentifierValue,
            },
        ];
    }));
};
const getPartyDataloader = (ctx, partyType) => {
    const { loaders } = ctx;
    // initialize DataLoader for getting payers by transfer IDs
    let dl = loaders.get(ID(partyType));
    if (!dl) {
        dl = new dataloader_1.default(async (transferIds) => {
            // Get DFSP by Transfer IDs
            const parties = await findParties(ctx, transferIds, partyType);
            // IMPORTANT: sort data in the same order as transferIds
            return transferIds.map((id) => parties[id]);
        });
        // Put instance of dataloader in WeakMap for future reuse
        loaders.set(ID(partyType), dl);
    }
    return dl;
};
exports.getPartyDataloader = getPartyDataloader;
//# sourceMappingURL=Party.js.map