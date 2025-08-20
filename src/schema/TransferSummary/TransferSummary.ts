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

// Define TransferGroup object type
export const TransferGroup = objectType({
  name: 'TransferGroup',
  definition(t) {
    t.string('errorCode');
    t.string('sourceCurrency');
    t.string('targetCurrency');
    t.string('payerDFSP');
    t.string('payeeDFSP');
  },
});

// Define TransferSummary object type
export const TransferSummary = objectType({
  name: 'TransferSummary',
  definition(t) {
    t.int('count');
    t.field('group', { type: 'TransferGroup' });
    t.field('sum', { type: 'TransferSummarySum' });
  },
});

// Define TransferSummarySum object type
export const TransferSummarySum = objectType({
  name: 'TransferSummarySum',
  definition(t) {
    t.float('sourceAmount');
    t.float('targetAmount');
  },
});

export default [TransferSummary, TransferGroup, TransferSummarySum];
