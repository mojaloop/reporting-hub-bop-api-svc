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
    t.nonNull.int('count');
    t.nonNull.float('sourceAmount');
    t.nonNull.string('sourceCurrency');
    t.nonNull.float('targetAmount');
    t.nonNull.string('targetCurrency');
  },
});

export default [TransferSummary];
