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

import {
  getQuoteEventsDataloader,
  getFxQuoteEventsDataloader,
  getFxTransferEventsDataloader,
  getPartyEventsDataloader,
  getTransferEventsDataloader,
  getSettlementEventsDataloader,
} from './dataloaders';

function createEventResolver(dataloaderName) {
  return async (parent, _, ctx) => {
    const transactionId = parent.transactionId;
    if (!transactionId) {
      return null;
    }
    return dataloaderName(ctx).load(transactionId);
  };
}

// Define TransferStateChange object type
const TransferStateChange = objectType({
  name: 'TransferStateChange',
  definition(t) {
    t.string('transferState');
    t.dateTimeFlex('dateTime');
    t.string('reason');
  },
});

// Define PositionChange object type
const PositionChange = objectType({
  name: 'PositionChange',
  definition(t) {
    t.float('change');
    t.string('currency');
    t.string('ledgerType');
    t.string('participantName');
    t.dateTimeFlex('dateTime');
    t.float('updatedPosition');
  },
});

// Define GeoCode object type
const GeoCode = objectType({
  name: 'GeoCode',
  definition(t) {
    t.string('latitude');
    t.string('longitude');
  },
});

// Define Amount object type
const Amount = objectType({
  name: 'Amount',
  definition(t) {
    t.float('amount');
    t.string('currency');
  },
});

// Define TransferTerms object type
const TransferTerms = objectType({
  name: 'TransferTerms',
  definition(t) {
    t.dateTimeFlex('expiration');
    t.field('geoCode', { type: 'GeoCode' });
    t.string('ilpPacket');
    t.field('payeeFspCommission', { type: 'Amount' });
    t.field('payeeFspFee', { type: 'Amount' });
    t.field('payeeReceiveAmount', { type: 'Amount' });
    t.field('transferAmount', { type: 'Amount' });
  },
});

// Define ConversionStateChanges object type
const ConversionStateChanges = objectType({
  name: 'ConversionStateChanges',
  definition(t) {
    t.string('conversionState');
    t.dateTimeFlex('dateTime');
    t.string('reason');
  },
});

// Define ConversionTermsCharges object type
const ConversionTermsCharges = objectType({
  name: 'ConversionTermsCharges',
  definition(t) {
    t.string('chargeType');
    t.field('sourceAmount', { type: 'Amount' });
    t.field('targetAmount', { type: 'Amount' });
  },
});

// Define ConversionTerms object type
const ConversionTerms = objectType({
  name: 'ConversionTerms',
  definition(t) {
    t.string('amountType');
    t.list.field('charges', { type: 'ConversionTermsCharges' });
    t.string('conversionId');
    t.string('counterPartyFsp');
    t.string('determiningTransferId');
    t.dateTimeFlex('expiration');
    t.string('ilpPacket');
    t.string('initiatingFsp');
    t.field('sourceAmount', { type: 'Amount' });
    t.field('targetAmount', { type: 'Amount' });
  },
});

// Define Conversions object type
const Conversions = objectType({
  name: 'Conversions',
  definition(t) {
    t.field('payer', { type: 'ConversionsObject' });
    t.field('payee', { type: 'ConversionsObject' });
  },
});

// Define ConversionsObject object type
const ConversionsObject = objectType({
  name: 'ConversionsObject',
  definition(t) {
    t.string('conversionCommitRequestId');
    t.string('conversionId');
    t.string('conversionRequestId');
    t.bigInt('conversionSettlementWindowId');
    t.string('conversionState');
    t.list.field('conversionStateChanges', { type: 'ConversionStateChanges' });
    t.field('conversionTerms', { type: 'ConversionTerms' });
    t.string('conversionType');
    t.string('counterPartyFSP');
    t.string('counterPartyProxy');
  },
});

// Define QuoteRequest object type
const QuoteRequest = objectType({
  name: 'QuoteRequest',
  definition(t) {
    t.string('quoteId');
    t.string('amountType');
    t.field('amount', { type: 'Amount' });
    t.field('fees', { type: 'Amount' });
  },
});

// Define TransferParty object type
const TransferParty = objectType({
  name: 'TransferParty',
  definition(t) {
    t.string('partyIdType');
    t.string('partyIdentifier');
    t.string('partyName');
    t.string('supportedCurrencies');
  },
});

// Define Transfer object type
const Transfer = objectType({
  name: 'Transfer',
  definition(t) {
    t.string('id');
    t.string('transferId');
    t.string('transactionId');
    t.float('sourceAmount');
    t.string('sourceCurrency');
    t.float('targetAmount');
    t.string('targetCurrency');
    t.dateTimeFlex('createdAt');
    t.dateTimeFlex('lastUpdated');
    t.string('transferState');
    t.string('transactionType');
    t.string('baseUseCase');
    t.string('errorCode');
    t.bigInt('transferSettlementWindowId');
    t.string('payerDFSP');
    t.string('payerDFSPProxy');
    t.string('payeeDFSP');
    t.string('payeeDFSPProxy');
    t.field('payerParty', { type: 'TransferParty' });
    t.field('payeeParty', { type: 'TransferParty' });
    t.field('quoteRequest', { type: 'QuoteRequest' });
    t.field('transferTerms', { type: 'TransferTerms' });
    t.list.field('positionChanges', { type: 'PositionChange' });
    t.list.field('transferStateChanges', { type: 'TransferStateChange' });
    t.field('conversions', { type: 'Conversions' });
    // Define resolver for transferSettlementBatchId lookup
    t.bigInt('transferSettlementBatchId', {
      resolve: async (parent, _, ctx) => {
        if (!parent.transferSettlementWindowId) {
          return null;
        }
        const settlement = await ctx.settlement.findOne({
          'settlementWindows.settlementWindowId': parent.transferSettlementWindowId,
        });
        return settlement ? settlement.settlementId : null;
      },
    });
    // Define resolver for conversionSettlementBatchId lookup
    t.bigInt('conversionSettlementBatchId', {
      resolve: async (parent, _, ctx) => {
        if (!parent.conversions?.payer?.conversionSettlementWindowId) {
          return null;
        }
        const settlement = await ctx.settlement.findOne({
          'settlementWindows.settlementWindowId': parent.conversions?.payer?.conversionSettlementWindowId,
        });
        return settlement ? settlement.settlementId : null;
      },
    });
    // Define resolver for quoteEvents lookup

    t.list.jsonObject('quoteEvents', {
      resolve: createEventResolver(getQuoteEventsDataloader),
    });

    // Define resolver for partyLookupEvents lookupy

    t.list.jsonObject('partyLookupEvents', {
      resolve: createEventResolver(getPartyEventsDataloader),
    });
    // Define resolver for settlementEvents lookup
    t.list.jsonObject('settlementEvents', {
      resolve: createEventResolver(getSettlementEventsDataloader),
    });
    // Define resolver for transferEvents lookup
    t.list.jsonObject('transferEvents', {
      resolve: createEventResolver(getTransferEventsDataloader),
    });
    // Define resolver for fxTransferEvents lookup
    t.list.jsonObject('fxTransferEvents', {
      resolve: createEventResolver(getFxTransferEventsDataloader),
    });
    // Define resolver for fxQuoteEvents lookup
    t.list.jsonObject('fxQuoteEvents', {
      resolve: createEventResolver(getFxQuoteEventsDataloader),
    });
  },
});

export default [
  Transfer,
  TransferStateChange,
  PositionChange,
  GeoCode,
  Amount,
  TransferTerms,
  Conversions,
  ConversionsObject,
  ConversionStateChanges,
  ConversionTerms,
  ConversionTermsCharges,
  QuoteRequest,
  TransferParty,
];
