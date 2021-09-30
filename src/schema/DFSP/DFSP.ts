/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { objectType } from 'nexus';

const DFSP = objectType({
  name: 'DFSP',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.string('name');
    t.nonNull.string('description');
    t.nonNull.boolean('active');
    t.nonNull.list.nonNull.field('currencies', {
      type: 'NonEmptyString',
      resolve: async (_parent, _args, ctx) => {
        const currencies = await ctx.centralLedger.participant
          .findUnique({
            where: {
              participantId: _parent.id,
            },
          })
          .participantCurrency();
        return currencies.map((currency) => currency.currencyId);
      },
    });
  },
});

export default [DFSP];
