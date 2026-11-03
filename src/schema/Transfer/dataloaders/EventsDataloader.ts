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

export const ReportingEventType = {
  FX_QUOTE: 'FxQuote',
  FX_TRANSFER: 'FxTransfer',
  PARTY_LOOKUP: 'PartyLookup',
  QUOTE: 'Quote',
  SETTLEMENT: 'Settlement',
  TRANSFER: 'Transfer',
} as const;

export type ReportingEvent = (typeof ReportingEventType)[keyof typeof ReportingEventType];

const EventField = {
  EVENT_TYPE: 'metadata.reporting.eventType',
  TRANSACTION_ID: 'metadata.reporting.transactionId',
} as const;

export const createEventsDataloader = (eventType: ReportingEvent) => {
  const id = Symbol(eventType);

  const findEvents = async (ctx: Context, transactionId: string) => {
    const events = await ctx.eventStore
      .find({
        [EventField.EVENT_TYPE]: eventType,
        [EventField.TRANSACTION_ID]: transactionId,
      })
      .toArray();
    return events.map((e) => e.event);
  };

  return (ctx: Context): DataLoader<string, any[]> => {
    const { loaders } = ctx;
    let dl = loaders.get(id);
    if (!dl) {
      dl = new DataLoader((transactionIds: readonly string[]) =>
        Promise.all(transactionIds.map((transactionId) => findEvents(ctx, transactionId)))
      );
      loaders.set(id, dl);
    }
    return dl;
  };
};
