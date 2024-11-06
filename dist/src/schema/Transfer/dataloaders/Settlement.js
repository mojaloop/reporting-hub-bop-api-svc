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
exports.getSettlementDataloader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const ID = Symbol();
const findSettlements = async (ctx, transferIds) => {
    const transfers = await ctx.centralLedger.transfer.findMany({
        where: {
            transferId: {
                in: transferIds,
            },
        },
        select: {
            transferId: true,
            transferFulfilment: {
                select: {
                    settlementWindow: {
                        select: {
                            settlementSettlementWindow: true,
                        },
                    },
                },
            },
        },
    });
    return Object.fromEntries(transfers.map((e) => [e.transferId, e.transferFulfilment[0]?.settlementWindow?.settlementSettlementWindow[0]]));
};
const getSettlementDataloader = (ctx) => {
    const { loaders } = ctx;
    // initialize DataLoader for getting payers by transfer IDs
    let dl = loaders.get(ID);
    if (!dl) {
        dl = new dataloader_1.default(async (transferIds) => {
            const results = await findSettlements(ctx, transferIds);
            // IMPORTANT: sort data in the same order as transferIds
            return transferIds.map((id) => results[id]);
        });
        // Put instance of dataloader in WeakMap for future reuse
        loaders.set(ID, dl);
    }
    return dl;
};
exports.getSettlementDataloader = getSettlementDataloader;
//# sourceMappingURL=Settlement.js.map