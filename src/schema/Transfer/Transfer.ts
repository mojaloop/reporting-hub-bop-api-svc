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
  EventType,
  getDFSPDataloader,
  getEventsDataloader,
  getPartyDataloader,
  getQuotesDataloader,
  getSettlementDataloader,
  getTransactionTypeDataloader,
  getTransferStateDataloader,
  getTransferTermsDataloader,
  getConversionsDataloader
  getConversionTermsDataloader
} from './dataloaders';
import { Context } from '@app/context';
import { getTransferErrorDataloader } from '@app/schema/Transfer/dataloaders/TransferError';

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
    t.field('errorCode', {
      type: 'Int', // 'TransferState'
      resolve: (parent, _, ctx) => {
        return getTransferErrorDataloader(ctx).load(parent.transferId);
      },
    });
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
      resolve: (parent, _, ctx) => {
        return getDFSPDataloader(ctx, 'PAYEE_DFSP').load(parent.transferId);
      },
    });

    // New fields
    /********************************************************************************************/
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
    t.field('transferTerms', {
      type: TransferTerms,
      resolve: async (parent, _, ctx) => {
        const terms = await getTransferTermsDataloader(ctx).load(parent.transferId);
        return terms;
      },
    });

    t.field('conversions', {
      type: Conversion,
      resolve: async (parent, _, ctx) => {
        return getConversionsDataloader(ctx).load(parent.transferId);
      },
    });
    t.field('conversionTerms', {
      type: ConversionTerms,
      resolve: async (parent, _, ctx) => {
        return getConversionTermsDataloader(ctx).load(parent.transferId);
      },
    });
    /********************************************************************************************/

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


// Add the required types for the new fields
const Party = objectType({
  name: 'Party',
  definition(t) {
    t.string('partyIdType');
    t.string('partyIdentifier');
    t.string('partyName');
    t.string('supportedCurrencies');
  },
});

const TransferTerms = objectType({
  name: 'TransferTerms',
  definition(t) {
    t.field('quoteAmount', {
      type: Amount,
    });
    t.string('quoteAmountType');
    t.field('transferAmount', {
      type: Amount,
    });
    t.field('payeeReceiveAmount', {
      type: Amount,
    });
    t.field('payeeDfspFee', {
      type: Amount,
    });
    t.field('payeeDfspCommission', {
      type: Amount,
    });
    t.string('expirationDate');
    t.field('geoCode', {
      type: GeoCode,
    });
    t.string('ilpPacket');
  },
});

const Conversion = objectType({
  name: 'Conversion',
  definition(t) {
    t.string('conversionRequestId');
    t.string('conversionId');
    t.string('conversionCommitRequestId');
    t.string('conversionState');
    t.string('conversionQuoteId')
    t.list.field('conversionStateChanges', {
      type: ConversionStateChange,
    });
    t.string('counterPartyFSP');
    t.string('conversionType');
    t.field('conversionTerms', { 
      type: ConversionTerms, });
  },
});

const ConversionTerms = objectType({
  name: 'ConversionTerms',
  definition(t) {
    t.field('charges', {
      type: Charges,
    });
    t.string('expiryDate');
    t.field('transferAmount', {
      type: TransferAmount,
    });
    t.string('exchangeRate');
  },
});

const ConversionStateChange = objectType({
  name: 'ConversionStateChange',
  definition(t) {
    t.string('conversionState');
    t.date('dateTime');
    t.string('reason');
  },
});

const GeoCode = objectType({
  name: 'GeoCode',
  definition(t) {
    t.string('latitude');
    t.string('longitude');
  },
});

const Amount = objectType({
  name: 'Amount',
  definition(t) {
    t.string('currency');
    t.decimal('amount');
  },
});

const Charges = objectType({
  name: 'Charges',
  definition(t) {
    t.field('totalSourceCurrencyCharges', {
      type: Amount,
    });
    t.field('totalTargetCurrencyCharges', {
      type: Amount,
    });
  },
});


const TransferAmount = objectType({
  name: 'TransferAmount',
  definition(t) {
    t.field('sourceAmount', {
      type: Amount,
    });
    t.field('targetAmount', {
      type: Amount,
    });
  },
});

export default [Transfer, TransactionType, TransferState];
