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

// Function to fetch all settlement events for a transactionId
const findSettlementEvent = async (ctx: Context, transactionId: string) => {
  const events = await ctx.eventStore.reportingData.findMany({
    where: {
      metadata: {
        equals: {
          reporting: {
            eventType: 'Settlement',
            transactionId: transactionId,
          },
        },
      },
    },
  });
  return events.map((e) => e.event); // return an array of events
};

// Create DataLoader for fetching settlement events by transactionId
export const getSettlementEventsDataloader = (ctx: Context): DataLoader<string, any[]> => {
  const { loaders } = ctx;

  // Initialize the DataLoader if it doesn't exist
  let dl = loaders.get(ID);
  if (!dl) {
    dl = new DataLoader(async (transactionIds: readonly string[]) => {
      // Fetch events for all transactionIds in batch
      const events = await Promise.all(transactionIds.map((transactionId) => findSettlementEvent(ctx, transactionId)));

      return events;
    });

    // Cache the DataLoader instance for reuse
    loaders.set(ID, dl);
  }

  return dl;
};
