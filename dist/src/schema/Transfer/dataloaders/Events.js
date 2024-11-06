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
exports.getEventsDataloader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const ID = (type) => Symbol.for(`EVENT_DL_${type}`);
const findEvents = async (ctx, filters, type) => {
    return ctx.eventStoreMongo
        .find({
        $or: filters.map((f) => ({
            $or: [
                { 'metadata.reporting.transactionId': f.transactionId },
                ...((f.settlementId && [{ 'metadata.reporting.settlementId': f.settlementId }]) || []),
                ...((f.settlementWindowId && [{ 'metadata.reporting.settlementWindowId': f.settlementWindowId }]) || []),
            ],
        })),
        'metadata.reporting.eventType': type,
    })
        .map((event) => ({
        event: event.event,
        ...(event.metadata.reporting.transactionId !== 'undefined' && {
            transactionId: event.metadata.reporting.transactionId,
        }),
        ...(event.metadata.reporting.settlementId !== 'undefined' && {
            settlementId: event.metadata.reporting.settlementId,
        }),
        ...(event.metadata.reporting.settlementWindowId !== 'undefined' && {
            settlementWindowId: event.metadata.reporting.settlementWindowId,
        }),
    }))
        .toArray();
};
const getEventsDataloader = (ctx, type) => {
    const { loaders } = ctx;
    // initialize DataLoader for getting payers by transfer IDs
    let dl = loaders.get(ID(type));
    if (!dl) {
        dl = new dataloader_1.default(async (filters) => {
            const events = await findEvents(ctx, filters, type);
            // IMPORTANT: sort data in the same order as transferIds
            const eventMap = {};
            for (let event of events) {
                const key = event.transactionId || event.settlementId || event.settlementWindowId;
                if (!eventMap[key]) {
                    eventMap[key] = [];
                }
                eventMap[key].push(event.event);
            }
            return filters.map((f) => [
                ...(eventMap[f.transactionId] || []),
                ...(eventMap[f.settlementId] || []),
                ...(eventMap[f.settlementWindowId] || []),
            ]);
        });
        // Put instance of dataloader in WeakMap for future reuse
        loaders.set(ID(type), dl);
    }
    return dl;
};
exports.getEventsDataloader = getEventsDataloader;
//# sourceMappingURL=Events.js.map