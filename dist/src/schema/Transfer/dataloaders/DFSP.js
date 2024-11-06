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
exports.getDFSPDataloader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const ID = (type) => Symbol.for(`DFSP_DL_${type}`);
const findDfsps = async (ctx, transferIds, type) => {
    const transferParticipant = await ctx.centralLedger.transferParticipant.findMany({
        where: {
            transferId: { in: transferIds },
            transferParticipantRoleType: { name: type },
        },
        select: {
            transferId: true,
            participant: true
        },
    });
    return Object.fromEntries(transferParticipant.map((t) => {
        const p = t.participant;
        return [
            t.transferId,
            {
                id: p?.participantId || 0,
                name: p?.name || '-',
                description: p?.description || '-',
                active: p?.isActive || false,
            },
        ];
    }));
};
const getDFSPDataloader = (ctx, dfspType) => {
    const { loaders } = ctx;
    // initialize DataLoader for getting payers by transfer IDs
    let dl = loaders.get(ID(dfspType));
    if (!dl) {
        dl = new dataloader_1.default(async (transferIds) => {
            // Get DFSP by Transfer IDs
            const dfsps = await findDfsps(ctx, transferIds, dfspType);
            // IMPORTANT: sort data in the same order as transferIds
            return transferIds.map((id) => dfsps[id]);
        });
        // Put instance of dataloader in WeakMap for future reuse
        loaders.set(ID(dfspType), dl);
    }
    return dl;
};
exports.getDFSPDataloader = getDFSPDataloader;
//# sourceMappingURL=DFSP.js.map