/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { stringArg, extendType, nonNull, list } from 'nexus';

const Query = extendType({
  type: 'Query',
  definition(t) {
    // Resolver to get a specific event by ID
    t.field('getEventById', {
      type: 'Event',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (parent, args, ctx) => {
        console.log('Fetching event with ID:', args.id);
        const event = await ctx.eventStore.reportingData.findUnique({
          where: {
            id: args.id,
          },
        });
        console.log('event value', event);
        if (!event) {
          console.log('NO event found');
          return null;
        }
        return {
          event: event,
          metadata: event,
        };
      },
    });

    // Resolver to get all events
    t.field('getAllEvents', {
      type: nonNull(list(nonNull('Event'))),
      resolve: async (parent, args, ctx) => {
        console.log('Fetching all events');
        const events = await ctx.eventStore.reportingData.findMany();
        console.log('events fetched', events);
        return events.map(event => ({
          event: event.event,
          metadata: event.metadata,
        }));
      },
    });
  },
});


export default Query;
