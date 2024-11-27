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
const TransferStateChange = objectType({
  name: 'TransferStateChange',
  definition(t) {
    t.nonNull.string('transferState');
    t.nonNull.dateTimeFlex('dateTime');
    t.string('reason');
  },
});
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

const GeoCode = objectType({
  name: 'GeoCode',
  definition(t) {
    t.nonNull.string('latitude');
    t.nonNull.string('longitude');
  },
});

const Amount = objectType({
  name: 'Amount',
  definition(t) {
    t.nonNull.float('amount');
    t.nonNull.string('currency');
  },
});

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

const ConversionStateChanges = objectType({
  name: 'ConversionStateChanges',
  definition(t) {
    t.nonNull.string('conversionState');
    t.nonNull.dateTimeFlex('dateTime');
    t.nonNull.string('reason');
  },
});

const ConversionTermsCharges = objectType({
  name: 'ConversionTermsCharges',
  definition(t) {
    t.nonNull.string('chargeType');
    t.nonNull.field('sourceAmount', { type: 'Amount' });
    t.nonNull.field('targetAmount', { type: 'Amount' });
  },
});

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

const Conversions = objectType({
  name: 'Conversions',
  definition(t) {
    t.field('payer', { type: 'ConversionsObject' });
    t.field('payee', { type: 'ConversionsObject' });
  },
});
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
const QuoteRequest = objectType({
  name: 'QuoteRequest',
  definition(t) {
    t.nonNull.string('quoteId');
    t.nonNull.string('amountType');
    t.field('amount', { type: 'Amount' });
    t.field('fees', { type: 'Amount' });
  },
});

const TransferParty = objectType({
  name: 'TransferParty',
  definition(t) {
    t.nonNull.string('partyIdType');
    t.nonNull.string('partyIdentifier');
    t.nonNull.string('partyName');
    t.nonNull.string('supportedCurrencies');
  },
});

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
    t.list.jsonObject('quoteEvents', {
      resolve: async (parent, args, ctx) => {
        const events = await ctx.eventStore.reportingData.findMany();
        const filteredEvents = events.filter((event) => {
          const metadata = (event.metadata as any)?.reporting;
          return metadata?.eventType === 'Quote' && metadata?.transactionId === parent.transactionId;
        });
        return filteredEvents.map((event) => event.event);
      },
    });
    t.list.jsonObject('partyLookupEvents', {
      resolve: async (parent, args, ctx) => {
        const events = await ctx.eventStore.reportingData.findMany();
        const filteredEvents = events.filter((event) => {
          const metadata = (event.metadata as any)?.reporting;
          return metadata?.eventType === 'PartyLookup' && metadata?.transactionId === parent.transactionId;
        });
        return filteredEvents.map((event) => event.event);
      },
    });
    t.list.jsonObject('settlementEvents', {
      resolve: async (parent, args, ctx) => {
        const events = await ctx.eventStore.reportingData.findMany();
        const filteredEvents = events.filter((event) => {
          const metadata = (event.metadata as any)?.reporting;
          return metadata?.eventType === 'Settlement' && metadata?.transactionId === parent.transactionId;
        });
        return filteredEvents.map((event) => event.event);
      },
    });
    t.list.jsonObject('transferEvents', {
      resolve: async (parent, args, ctx) => {
        const events = await ctx.eventStore.reportingData.findMany();
        const filteredEvents = events.filter((event) => {
          const metadata = (event.metadata as any)?.reporting;
          return metadata?.eventType === 'Transfer' && metadata?.transactionId === parent.transactionId;
        });
        return filteredEvents.map((event) => event.event);
      },
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
