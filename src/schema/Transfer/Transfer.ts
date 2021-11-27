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
import {
  getDFSPDataloader,
  getPartyDataloader,
  getEventsDataloader,
  getTransferStateDataloader,
  getQuotesDataloader,
  getTransactionTypeDataloader,
  getSettlementDataloader,
  EventType,
} from './dataloaders';
import { Context } from '@app/context';

const TransferState = enumType({
  name: 'TransferState',
  members: ['ABORTED', 'COMMITTED', 'RESERVED', 'SETTLED'],
});

const TransactionType = enumType({
  name: 'TransactionType',
  members: ['TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND'],
});

const getEvents = async (ctx: Context, transferId: string, eventType: EventType) => {
  const [settlement, quote] = await Promise.all([
    getSettlementDataloader(ctx).load(transferId),
    getQuotesDataloader(ctx).load(transferId),
  ]);
  return getEventsDataloader(ctx, eventType).load({
    transactionId: quote?.transactionReferenceId,
    settlementId: settlement?.settlementId?.toString(),
    settlementWindowId: settlement?.settlementWindowId?.toString(),
  });
};

const Transfer = objectType({
  name: 'Transfer',
  definition(t) {
    t.nonNull.string('transferId');
    t.field('transactionId', {
      type: 'String',
      resolve: async (parent, _, ctx) => {
        const quote = await getQuotesDataloader(ctx).load(parent.transferId);
        return quote?.transactionReferenceId;
      },
    });
    t.field('quoteId', {
      type: 'String',
      resolve: async (parent, _, ctx) => {
        const quote = await getQuotesDataloader(ctx).load(parent.transferId);
        return quote?.quoteId;
      },
    });
    t.decimal('amount');
    t.currency('currency');
    t.string('createdAt');
    t.field('transferState', {
      type: 'String', // 'TransferState'
      resolve: (parent, _, ctx) => {
        return getTransferStateDataloader(ctx).load(parent.transferId);
      },
    });
    t.field('transactionType', {
      type: 'String', // TransactionType
      resolve: async (parent, _, ctx) => {
        const quote = await getQuotesDataloader(ctx).load(parent.transferId);
        if (quote?.transactionScenarioId) {
          const txType = await getTransactionTypeDataloader(ctx).load(quote.transactionScenarioId);
          return txType.name;
        }
        return null;
      },
    });
    t.int('errorCode');
    t.field('settlementWindowId', {
      type: 'BigInt',
      resolve: async (parent, _, ctx) => {
        const settlement = await getSettlementDataloader(ctx).load(parent.transferId);
        return settlement?.settlementWindowId;
      },
    });
    t.field('settlementId', {
      type: 'BigInt',
      resolve: async (parent, _, ctx) => {
        const settlement = await getSettlementDataloader(ctx).load(parent.transferId);
        return settlement?.settlementId;
      },
    });
    t.field('payerDFSP', {
      type: 'DFSP',
      resolve: (parent, _, ctx) => {
        return getDFSPDataloader(ctx, 'PAYER_DFSP').load(parent.transferId);
      },
    });
    t.field('payeeDFSP', {
      type: 'DFSP',
      resolve: async (parent, _, ctx) => {
        return getDFSPDataloader(ctx, 'PAYEE_DFSP').load(parent.transferId);
      },
    });
    t.field('payerParty', {
      type: 'Party',
      resolve: (parent, _, ctx) => {
        return getPartyDataloader(ctx, 'PAYER').load(parent.transferId);
      },
    });
    t.field('payeeParty', {
      type: 'Party',
      resolve: async (parent, _, ctx) => {
        return getPartyDataloader(ctx, 'PAYEE').load(parent.transferId);
      },
    });
    t.list.jsonObject('partyLookupEvents', {
      resolve: async (parent, _, ctx) => {
        return getEvents(ctx, parent.transferId, 'PartyLookup');
      },
    });
    t.list.jsonObject('quoteEvents', {
      resolve: async (parent, _, ctx) => {
        return getEvents(ctx, parent.transferId, 'Quote');
      },
    });
    t.list.jsonObject('transferEvents', {
      resolve: async (parent, _, ctx) => {
        return getEvents(ctx, parent.transferId, 'Transfer');
      },
    });
    t.list.jsonObject('settlementEvents', {
      resolve: async (parent, _, ctx) => {
        return getEvents(ctx, parent.transferId, 'Settlement');
      },
    });
  },
});

export default [Transfer, TransactionType, TransferState];
