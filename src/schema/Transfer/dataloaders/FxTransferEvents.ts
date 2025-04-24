/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { Context } from '@app/context';
import DataLoader from 'dataloader';

const ID = Symbol();

// Function to fetch all FxTransfer events for a transactionId
const findFxTransferEvent = async (ctx: Context, transactionId: string) => {
  const events = await ctx.eventStore.find({
    'metadata.reporting.eventType': 'FxTransfer',
    'metadata.reporting.transactionId': transactionId,
  }).toArray();

  return events.map((e) => e.event); // return an array of events
};

// Create DataLoader for fetching FxTransfer events by transactionId
export const getFxTransferEventsDataloader = (ctx: Context): DataLoader<string, any[]> => {
  const { loaders } = ctx;

  // Initialize the DataLoader if it doesn't exist
  let dl = loaders.get(ID);
  if (!dl) {
    dl = new DataLoader(async (transactionIds: readonly string[]) => {
      // Fetch events for all transactionIds in batch
      const events = await Promise.all(transactionIds.map((transactionId) => findFxTransferEvent(ctx, transactionId)));

      return events;
    });

    // Cache the DataLoader instance for reuse
    loaders.set(ID, dl);
  }

  return dl;
};
