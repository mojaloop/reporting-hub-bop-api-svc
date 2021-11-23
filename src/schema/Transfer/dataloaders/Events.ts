/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { GraphQLResolveInfo } from 'graphql';
import { Context } from '@app/context';
import DataLoader from 'dataloader';

type EventType = 'Quote' | 'Transfer' | 'Settlement' | 'PartyLookup';

interface EventFilter {
  transactionId: string;
  settlementId: string;
  settlementWindowId: string;
}

const findEvents = async (ctx: Context, filters: EventFilter[], type: EventType) => {
  return ctx.eventStoreMongo
    .find({
      $or: filters.map((f) => ({
        $or: [
          { 'metadata.reporting.transactionId': f.transactionId },
          ...(f.settlementId || f.settlementWindowId
            ? [
                {
                  $and: [
                    { 'metadata.reporting.transactionId': { $exists: false } },
                    {
                      $or: [
                        ...((f.settlementId && [{ 'metadata.reporting.settlementId': f.settlementId }]) || []),
                        ...((f.settlementWindowId && [
                          { 'metadata.reporting.settlementWindowId': f.settlementWindowId },
                        ]) ||
                          []),
                      ],
                    },
                  ],
                },
              ]
            : []),
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

export const getEventsDataloader = (ctx: Context, info: GraphQLResolveInfo, type: EventType) => {
  const { loaders } = ctx;

  // initialize DataLoader for getting payers by transfer IDs
  let dl = loaders.get(info.fieldNodes);
  if (!dl) {
    dl = new DataLoader(async (filters: readonly EventFilter[]) => {
      const events = await findEvents(ctx, filters as EventFilter[], type);
      // IMPORTANT: sort data in the same order as transferIds
      const eventMap: Record<string, any> = {};
      for (let event of events) {
        const key = event.transactionId || event.settlementId || event.settlementWindowId;
        if (!eventMap[key]) {
          eventMap[key] = [];
        }
        eventMap[key].push(event.event);
      }
      return filters.map(
        (f) => eventMap[f.transactionId] || eventMap[f.settlementId] || eventMap[f.settlementWindowId] || []
      );
    });
    // Put instance of dataloader in WeakMap for future reuse
    loaders.set(info.fieldNodes, dl);
  }
  return dl;
};
