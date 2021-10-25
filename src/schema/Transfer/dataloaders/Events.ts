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

const findEvents = async (ctx: Context, transactionIds: string[], type: EventType) => {
  return ctx.eventStoreMongo
    .find({
      'metadata.reporting.transactionId': { $in: transactionIds },
      'metadata.reporting.eventType': type,
    })
    .map((event) => ({
      event: event.event,
      transactionId: event.metadata.reporting.transactionId,
    }))
    .toArray();
};

export const getEventsDataloader = (ctx: Context, info: GraphQLResolveInfo, type: EventType) => {
  const { loaders } = ctx;

  // initialize DataLoader for getting payers by transfer IDs
  let dl = loaders.get(info.fieldNodes);
  if (!dl) {
    dl = new DataLoader(async (transactionIds: readonly string[]) => {
      // Get DFSP by Transfer IDs
      const events = await findEvents(ctx, transactionIds as string[], type);
      // IMPORTANT: sort data in the same order as transferIds
      return transactionIds
        .map((tid) => events.find((e) => e.transactionId === tid))
        .map((event) => ({ ...event?.event }));
    });
    // Put instance of dataloader in WeakMap for future reuse
    loaders.set(info.fieldNodes, dl);
  }
  return dl;
};
