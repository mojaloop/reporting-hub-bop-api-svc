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
exports.getTransferStateDataloader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const ID = Symbol();
const findTransferStates = async (ctx, transferIds) => {
    const trStates = await ctx.centralLedger.transferStateChange.findMany({
        where: {
            transferId: {
                in: transferIds,
            },
        },
        select: {
            transferId: true,
            transferState: {
                select: {
                    enumeration: true,
                },
            },
        },
    });
    return Object.fromEntries(trStates.map((e) => [e.transferId, e.transferState.enumeration]));
};
const getTransferStateDataloader = (ctx) => {
    const { loaders } = ctx;
    // initialize DataLoader for getting payers by transfer IDs
    let dl = loaders.get(ID);
    if (!dl) {
        dl = new dataloader_1.default(async (transferIds) => {
            const states = await findTransferStates(ctx, transferIds);
            // IMPORTANT: sort data in the same order as transferIds
            return transferIds.map((tid) => states[tid]);
        });
        // Put instance of dataloader in WeakMap for future reuse
        loaders.set(ID, dl);
    }
    return dl;
};
exports.getTransferStateDataloader = getTransferStateDataloader;
//# sourceMappingURL=TransferState.js.map