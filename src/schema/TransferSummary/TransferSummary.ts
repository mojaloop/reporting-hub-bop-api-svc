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

export const TransferGroup = objectType({
  name: 'TransferGroup',
  definition(t) {
    t.int('errorCode');
    t.string('sourceCurrency');
    t.string('targetCurrency');
    t.string('payerDFSP');
    t.string('payeeDFSP');
  },
});

export const TransferSummary = objectType({
  name: 'TransferSummary',
  definition(t) {
    t.nonNull.int('count');
    t.nonNull.field('group', { type: 'TransferGroup' });
    t.nonNull.field('sum', { type: 'TransferSummarySum' });
  },
});

export const TransferSummarySum = objectType({
  name: 'TransferSummarySum',
  definition(t) {
    t.nonNull.float('sourceAmount');
    t.nonNull.float('targetAmount');
  },
});

export default [TransferSummary, TransferGroup, TransferSummarySum];
