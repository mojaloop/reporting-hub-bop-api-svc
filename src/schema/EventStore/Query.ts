/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { queryType, stringArg, jsonArg, extendType, nonNull } from 'nexus';

const Query = extendType({
  type: 'Query',
  definition(t) {
    t.field('getAllEvent', {
      type: 'Event',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (parent, args, ctx) => {
        const event = await ctx.eventStore.reportingData.findMany({
          where: {
            id: args.id,
          },
        });
        if (!event) {
          console.log('NO event found ');
          return null;
        }
        return {
          event: event[0].event,
          metadata: event[0].metadata,
        };
      },
    });
  },
});

export default Query;
