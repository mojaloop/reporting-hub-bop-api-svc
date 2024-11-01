const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the payer and payee parties
const PartySchema = new Schema({
  partyIdType: String,
  partyIdentifier: String,
  partyName: String,
  supportedCurrencies: String,
});

// Define the schema for the quote request
const QuoteRequestSchema = new Schema({
  quoteId: String,
  amountType: String,
  amount: {
    currency: String,
    amount: Number,
  },
  fees: {
    currency: String,
    amount: Number,
  },
});

// Define the schema for the transfer terms
const TransferTermsSchema = new Schema({
  transferAmount: {
    currency: String,
    amount: Number,
  },
  payeeReceiveAmount: {
    currency: String,
    amount: Number,
  },
  payeeFspFee: {
    currency: String,
    amount: Number,
  },
  payeeFspCommission: {
    currency: String,
    amount: Number,
  },
  expiration: Date,
  geoCode: {
    latitude: String,
    longitude: String,
  },
  ilpPacket: String,
});

// Define the schema for the conversion terms
const ConversionTermsSchema = new Schema({
  conversionId: String,
  determiningTransferId: String,
  initiatingFsp: String,
  counterPartyFsp: String,
  amountType: String,
  sourceAmount: {
    currency: String,
    amount: Number,
  },
  targetAmount: {
    currency: String,
    amount: Number,
  },
  expiration: Date,
  charges: [
    {
      chargeType: String,
      sourceAmount: {
        currency: String,
        amount: Number,
      },
      targetAmount: {
        currency: String,
        amount: Number,
      },
    },
  ],
  ilpPacket: String,
});

// Define the schema for conversions
const ConversionSchema = new Schema({
  conversionRequestId: String,
  conversionId: String,
  conversionCommitRequestId: String,
  conversionState: String,
  conversionStateChanges: [
    {
      conversionState: String,
      dateTime: Date,
      reason: String,
    },
  ],
  counterPartyFSP: String,
  conversionType: String,
  conversionSettlementWindowId: Schema.Types.Int64,
  conversionTerms: ConversionTermsSchema,
});

// Define the schema for transactions
const TransactionSchema = new Schema({
  transferId: { type: String, index: true },
  transactionId: String,
  sourceAmount: Number,
  sourceCurrency: { type: String, index: true },
  targetAmount: Number,
  targetCurrency: { type: String, index: true },
  createdAt: { type: Date, index: true },
  lastUpdated: Date,
  transferState: { type: String, index: true },
  transferStateChanges: [
    {
      transferState: String,
      dateTime: Date,
      reason: String,
    },
  ],
  transactionType: { type: String, index: true },
  errorCode: { type: String, index: true },
  transferSettlementWindowId: Schema.Types.Int64,
  payerDFSP: { type: String, index: true },
  payerDFSPProxy: { type: String, index: true },
  payeeDFSP: { type: String, index: true },
  payeeDFSPProxy: { type: String, index: true },
  positionChanges: [
    {
      participantName: String,
      currency: String,
      ledgerType: String,
      dateTime: Date,
      updatedPosition: String,
      change: String,
    },
  ],
  payerParty: {
    partyIdType: { type: String, index: true },
    partyIdentifier: { type: String, index: true },
    partyName: String,
    supportedCurrencies: String,
  },
  payeeParty: {
    partyIdType: { type: String, index: true },
    partyIdentifier: { type: String, index: true },
    partyName: String,
    supportedCurrencies: String,
  },
  quoteRequest: QuoteRequestSchema,
  transferTerms: TransferTermsSchema,
  conversions: [ConversionSchema],
});

// Define the schema for settlement windows
const SettlementWindowSchema = new Schema({
  settlementWindowId: { type: Schema.Types.Int64, index: true },
});

// Define the schema for settlements
const SettlementSchema = new Schema({
  settlementWindows: [SettlementWindowSchema],
  settlementId: { type: Schema.Types.Int64, index: true },
  createdAt: Date,
  lastUpdatedAt: Date,
  settlementModel: String,
  settlementStatus: String,
});

// Create models
const Transaction = mongoose.model('Transaction', TransactionSchema);
const Settlement = mongoose.model('Settlement', SettlementSchema);

module.exports = {
  Transaction,
  Settlement,
};
export default [Transaction, Settlement];
