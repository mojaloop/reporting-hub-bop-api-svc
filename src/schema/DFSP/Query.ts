/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { extendType } from 'nexus';

const Query = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('dfsps', {
      type: 'DFSP',
      resolve: async (_parent, _args, ctx) => {
        const dfsps = await ctx.centralLedger.participant.findMany();
        return dfsps.map((dfsp) => ({
          id: dfsp.participantId,
          name: dfsp.name,
          description: dfsp.name,
          active: dfsp.isActive,
        }));
      },
    });
  },
});

export default [Query];
