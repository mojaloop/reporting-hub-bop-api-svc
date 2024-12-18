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
    return await dataloaderName(ctx).load(transactionId);
  };
}

// Define TransferStateChange object type
const TransferStateChange = objectType({
  name: 'TransferStateChange',
  definition(t) {
    t.nonNull.string('transferState');
    t.nonNull.dateTimeFlex('dateTime');
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
    t.nonNull.dateTimeFlex('dateTime');
    t.float('updatedPosition');
  },
});

// Define GeoCode object type
const GeoCode = objectType({
  name: 'GeoCode',
  definition(t) {
    t.nonNull.string('latitude');
    t.nonNull.string('longitude');
  },
});

// Define Amount object type
const Amount = objectType({
  name: 'Amount',
  definition(t) {
    t.nonNull.float('amount');
    t.nonNull.string('currency');
  },
});

// Define TransferTerms object type
const TransferTerms = objectType({
  name: 'TransferTerms',
  definition(t) {
    t.nonNull.dateTimeFlex('expiration');
    t.nonNull.field('geoCode', { type: 'GeoCode' });
    t.nonNull.string('ilpPacket');
    t.nonNull.field('payeeFspCommission', { type: 'Amount' });
    t.nonNull.field('payeeFspFee', { type: 'Amount' });
    t.nonNull.field('payeeReceiveAmount', { type: 'Amount' });
    t.nonNull.field('transferAmount', { type: 'Amount' });
  },
});

// Define ConversionStateChanges object type
const ConversionStateChanges = objectType({
  name: 'ConversionStateChanges',
  definition(t) {
    t.nonNull.string('conversionState');
    t.nonNull.dateTimeFlex('dateTime');
    t.nonNull.string('reason');
  },
});

// Define ConversionTermsCharges object type
const ConversionTermsCharges = objectType({
  name: 'ConversionTermsCharges',
  definition(t) {
    t.nonNull.string('chargeType');
    t.nonNull.field('sourceAmount', { type: 'Amount' });
    t.nonNull.field('targetAmount', { type: 'Amount' });
  },
});

// Define ConversionTerms object type
const ConversionTerms = objectType({
  name: 'ConversionTerms',
  definition(t) {
    t.nonNull.string('amountType');
    t.nonNull.list.field('charges', { type: 'ConversionTermsCharges' });
    t.nonNull.string('conversionId');
    t.nonNull.string('counterPartyFsp');
    t.nonNull.string('determiningTransferId');
    t.nonNull.dateTimeFlex('expiration');
    t.nonNull.string('ilpPacket');
    t.nonNull.string('initiatingFsp');
    t.nonNull.field('sourceAmount', { type: 'Amount' });
    t.nonNull.field('targetAmount', { type: 'Amount' });
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
    t.nonNull.string('conversionCommitRequestId');
    t.nonNull.string('conversionId');
    t.nonNull.string('conversionRequestId');
    t.nonNull.bigInt('conversionSettlementWindowId');
    t.nonNull.string('conversionState');
    t.list.field('conversionStateChanges', { type: 'ConversionStateChanges' });
    t.nonNull.field('conversionTerms', { type: 'ConversionTerms' });
    t.nonNull.string('conversionType');
    t.nonNull.string('counterPartyFSP');
    t.nonNull.string('counterPartyProxy');
  },
});

// Define QuoteRequest object type
const QuoteRequest = objectType({
  name: 'QuoteRequest',
  definition(t) {
    t.nonNull.string('quoteId');
    t.nonNull.string('amountType');
    t.field('amount', { type: 'Amount' });
    t.field('fees', { type: 'Amount' });
  },
});

// Define TransferParty object type
const TransferParty = objectType({
  name: 'TransferParty',
  definition(t) {
    t.nonNull.string('partyIdType');
    t.nonNull.string('partyIdentifier');
    t.nonNull.string('partyName');
    t.nonNull.string('supportedCurrencies');
  },
});

// Define Transfer object type
const Transfer = objectType({
  name: 'Transfer',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('transferId');
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
        const settlement = await ctx.settlement.settlement.findFirst({
          where: {
            settlementWindows: {
              some: {
                settlementWindowId: parent.transferSettlementWindowId as unknown as number,
              },
            },
          },
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
        const settlement = await ctx.settlement.settlement.findFirst({
          where: {
            settlementWindows: {
              some: {
                settlementWindowId: parent.conversions?.payer?.conversionSettlementWindowId as unknown as number,
              },
            },
          },
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
