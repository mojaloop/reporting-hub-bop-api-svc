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

const TransferSummary = objectType({
  name: 'TransferSummary',
  definition(t) {
    t.nonNull.bigInt('count');
    t.nonNull.decimal('amount');
    t.field('errorCode', { type: 'Int' });
    t.field('payerDFSP', { type: 'String' });
    t.field('payeeDFSP', { type: 'String' });
    t.field('targetCurrency', { type: 'String' });
    t.field('sourceCurrency', { type: 'String' });
    // t.nonNull.list.nonNull.field('dfsps', {
    //   type: 'DFSP',
    //   resolve: (parent, _, context) =>
    //     context.centralLedger.membership
    //       .findUnique({
    //         where: {
    //           id: parent.id,
    //         },
    //       })
    //       .user(),
    // });
  },
});

export default [TransferSummary];
