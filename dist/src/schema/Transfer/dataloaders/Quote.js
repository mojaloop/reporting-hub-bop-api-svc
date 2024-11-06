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
exports.getQuotesDataloader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const ID = Symbol();
const findQuotes = async (ctx, transferIds) => {
    const transfers = await ctx.centralLedger.transfer.findMany({
        where: {
            transferId: {
                in: transferIds,
            },
        },
        select: {
            transferId: true,
            quote: true,
        },
    });
    return Object.fromEntries(transfers.map((e) => [e.transferId, e.quote[0]]));
};
const getQuotesDataloader = (ctx) => {
    const { loaders } = ctx;
    // initialize DataLoader for getting payers by transfer IDs
    let dl = loaders.get(ID);
    if (!dl) {
        dl = new dataloader_1.default(async (transferIds) => {
            const quotes = await findQuotes(ctx, transferIds);
            // IMPORTANT: sort data in the same order as transferIds
            return transferIds.map((tid) => quotes[tid]);
        });
        // Put instance of dataloader in WeakMap for future reuse
        loaders.set(ID, dl);
    }
    return dl;
};
exports.getQuotesDataloader = getQuotesDataloader;
//# sourceMappingURL=Quote.js.map