/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { enumType, objectType } from 'nexus';
import { getDFSPDataloader, getPartyDataloader, getEventsDataloader } from './dataloaders';

const TransferState = enumType({
  name: 'TransferState',
  members: ['ABORTED', 'COMMITTED', 'RESERVED', 'SETTLED'],
});

const TransactionType = enumType({
  name: 'TransactionType',
  members: ['TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND'],
});

const Transfer = objectType({
  name: 'Transfer',
  definition(t) {
    t.nonNull.string('transferId');
    t.string('transactionId');
    t.string('quoteId');
    t.decimal('amount');
    t.currency('currency');
    t.string('createdAt');
    // t.field('transferState', { type: 'TransferState' });
    t.field('transferState', { type: 'String' });
    // t.field('transactionType', { type: 'TransactionType' });
    t.field('transactionType', { type: 'String' });
    t.int('errorCode');
    t.bigInt('settlementWindowId');
    t.bigInt('settlementId');
    t.field('payerDFSP', {
      type: 'DFSP',
      resolve: (parent, _, ctx, info) => {
        const dl = getDFSPDataloader(ctx, info, 'PAYER_DFSP');
        return dl.load(parent.transferId);
      },
    });
    t.field('payeeDFSP', {
      type: 'DFSP',
      resolve: async (parent, _, ctx, info) => {
        const dl = getDFSPDataloader(ctx, info, 'PAYEE_DFSP');
        return dl.load(parent.transferId);
      },
    });
    t.field('payerParty', {
      type: 'Party',
      resolve: (parent, _, ctx, info) => {
        const dl = getPartyDataloader(ctx, info, 'PAYER');
        return dl.load(parent.transferId);
      },
    });
    t.field('payeeParty', {
      type: 'Party',
      resolve: async (parent, _, ctx, info) => {
        const dl = getPartyDataloader(ctx, info, 'PAYEE');
        return dl.load(parent.transferId);
      },
    });
    t.list.jsonObject('partyLookupEvents', {
      resolve: async (parent, _, ctx, info) => {
        const dl = getEventsDataloader(ctx, info, 'PartyLookup');
        return dl.load({
          transactionId: parent.transactionId,
          settlementId: parent.settlementId?.toString(),
          settlementWindowId: parent.settlementWindowId?.toString(),
        });
      },
    });
    t.list.jsonObject('quoteEvents', {
      resolve: async (parent, _, ctx, info) => {
        const dl = getEventsDataloader(ctx, info, 'Quote');
        return dl.load({
          transactionId: parent.transactionId,
          settlementId: parent.settlementId?.toString(),
          settlementWindowId: parent.settlementWindowId?.toString(),
        });
      },
    });
    t.list.jsonObject('transferEvents', {
      resolve: async (parent, _, ctx, info) => {
        const dl = getEventsDataloader(ctx, info, 'Transfer');
        return dl.load({
          transactionId: parent.transactionId,
          settlementId: parent.settlementId?.toString(),
          settlementWindowId: parent.settlementWindowId?.toString(),
        });
      },
    });
    t.list.jsonObject('settlementEvents', {
      resolve: async (parent, _, ctx, info) => {
        const dl = getEventsDataloader(ctx, info, 'Settlement');
        return dl.load({
          transactionId: parent.transactionId,
          settlementId: parent.settlementId?.toString(),
          settlementWindowId: parent.settlementWindowId?.toString(),
        });
      },
    });
  },
});

export default [Transfer, TransactionType, TransferState];
