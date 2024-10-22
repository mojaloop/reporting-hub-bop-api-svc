# Transaction Reporting Object

The transaction object is needed for
1. displaying the details of a transfer
   - selected by transferId
2. displaying the list summary of transfers that can be filter by 
   - date range
   - source currency
   - target currency
   - transfer State
   - conversion State
   - transaction type
   - payer dfsp
   - payer dfsp Proxy
   - payee dfsp
   - payee dfsp Proxy
   - error code
   - payer identifier type
   - payer identifier Id
   - payee identifier type
   - payee identifier Id
3. an aggregated total 
   1. grouped by a selection of these
      - error Code
      - payer DFSP
      - payee DFSP
      - source Currency
      - target currency
   2. and filter by
      - date range

```json
{
  "transaction": {
    "transferId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
    "transactionId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
    "sourceAmount": 100.50,
    "sourceCurrency": "USD",
    "targetAmount": 91.50,
    "targetCurrency": "EUR",
    "createdAt": "2023-09-25T12:34:56Z",
    "lastUpdated": "2023-09-25T12:34:56Z",
    "transferState": "COMMITTED",
    "transferStateChanges": [{
       "transferState": "",
       "dateTime": "",
       "reason": ""
     }],
    "transactionType": "PAYMENT",
    "errorCode": null,
    "transferSettlementWindowId": "16436",
    "payerDFSP": "payerDFSP001",
    "payerDFSPProxy": null,
    "payeeDFSP": "payeeDFSP002",
    "payeeDFSPProxy": "CInternationalClearing",
    "positionChanges": [{
       "participantName": "payerDFSP001",
       "currency": "USD",
       "ledgerType": "POSITION",
       "dateTime": "2016-05-24T08:38:08.699-04:00",
       "updatedPosition": "10010.10",
       "change": "10.10"
     }],
    "payerParty": {
      "partyIdType": "MSISDN",
      "partyIdentifier": "+123456789",
      "partyName": "John Doe",
      "supportedCurrencies": "USD"
    },
    "payeeParty": {
      "partyIdType": "MSISDN",
      "partyIdentifier": "+987654321",
      "partyName": "Jane Smith",
      "supportedCurrencies": "EUR"
    },
    "quoteRequest": {
        "quoteId": "quote789",
        "amountType": "SEND",
        "amount": {
          "currency": "USD",
          "amount": "123.45"
        },
        "fees": {
          "currency": "USD",
          "amount": "1.45"
        },      
      },
    "transferTerms": {
      "transferAmount": {
        "currency": "AED",
        "amount": "123.45"
      },
      "payeeReceiveAmount": {
        "currency": "AED",
        "amount": "123.45"
      },
      "payeeFspFee": {
        "currency": "AED",
        "amount": "123.45"
      },
      "payeeFspCommission": {
        "currency": "AED",
        "amount": "123.45"
      },
      "expiration": "2016-05-24T08:38:08.699-04:00",
      "geoCode": {
        "latitude": "+45.4215",
        "longitude": "+75.6972"
      },
      "ilpPacket": "pck"   
    },
    "conversions": [{
      "conversionRequestId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
      "conversionId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
      "conversionCommitRequestId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
      "conversionState": "COMMITTED",
       "conversionStateChanges": [{
          "conversionState": "RESERVED",
          "dateTime": "2016-05-24T08:38:08.699-04:00",
          "reason": ""
        }],
      "counterPartyFSP": "FXP",    
      "conversionType": "Payer DFSP Conversion",
      "conversionSettlementWindowId":"16436",
      "conversionTerms": {
          "conversionId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
          "determiningTransferId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
          "initiatingFsp": "string",
          "counterPartyFsp": "string",
          "amountType": "RECEIVE",
          "sourceAmount": {
            "currency": "AED",
            "amount": "123.45"
          },
          "targetAmount": {
            "currency": "AED",
            "amount": "123.45"
          },
          "expiration": "2016-05-24T08:38:08.699-04:00",
          "charges": [
            {
              "chargeType": "string",
              "sourceAmount": {
                "currency": "AED",
                "amount": "123.45"
              },
              "targetAmount": {
                "currency": "AED",
                "amount": "123.45"
              }
            }
          ],
         "ilpPacket": "pck"   
        },              
      }],
  }
}
```
# Settlement Reporting object

```json
{
  "settlement" : {
  "settlementWindows":[ {"settlementWindowId":"1234"}],
  "settlementId":"1",
  "createdAt":"2016-05-24T08:38:08.699-04:00",
  "settlementModel":"DEFAULT_DEFERREDNET", 
  "lastUpdatedAt":"2016-05-24T08:38:08.699-04:00",
  "settlementStatus":"SETTLED",
  }
}
```

# Reporting DB schema

```js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the payer and payee parties
const PartySchema = new Schema({
  partyIdType: String,
  partyIdentifier: String,
  partyName: String,
  supportedCurrencies: String
});

// Define the schema for the quote request
const QuoteRequestSchema = new Schema({
  quoteId: String,
  amountType: String,
  amount: {
    currency: String,
    amount: Number
  },
  fees: {
    currency: String,
    amount: Number
  }
});

// Define the schema for the transfer terms
const TransferTermsSchema = new Schema({
  transferAmount: {
    currency: String,
    amount: Number
  },
  payeeReceiveAmount: {
    currency: String,
    amount: Number
  },
  payeeFspFee: {
    currency: String,
    amount: Number
  },
  payeeFspCommission: {
    currency: String,
    amount: Number
  },
  expiration: Date,
  geoCode: {
    latitude: String,
    longitude: String
  },
  ilpPacket: String
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
    amount: Number
  },
  targetAmount: {
    currency: String,
    amount: Number
  },
  expiration: Date,
  charges: [{
    chargeType: String,
    sourceAmount: {
      currency: String,
      amount: Number
    },
    targetAmount: {
      currency: String,
      amount: Number
    }
  }],
  ilpPacket: String
});

// Define the schema for conversions
const ConversionSchema = new Schema({
  conversionRequestId: String,
  conversionId: String,
  conversionCommitRequestId: String,
  conversionState: String,
  conversionStateChanges: [{
    conversionState: String,
    dateTime: Date,
    reason: String
  }],
  counterPartyFSP: String,
  conversionType: String,
  conversionSettlementWindowId: Schema.Types.Int64,
  conversionTerms: ConversionTermsSchema
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
  transferStateChanges: [{
    transferState: String,
    dateTime: Date,
    reason: String
  }],
  transactionType: { type: String, index: true },
  errorCode: { type: String, index: true },
  transferSettlementWindowId: Schema.Types.Int64,
  payerDFSP: { type: String, index: true },
  payerDFSPProxy: { type: String, index: true },
  payeeDFSP: { type: String, index: true },
  payeeDFSPProxy: { type: String, index: true },
  positionChanges: [{
    participantName: String,
    currency: String,
    ledgerType: String,
    dateTime: Date,
    updatedPosition: String,
    change: String
  }],
  payerParty: {
    partyIdType: { type: String, index: true },
    partyIdentifier: { type: String, index: true },
    partyName: String,
    supportedCurrencies: String
  },
  payeeParty: {
    partyIdType: { type: String, index: true },
    partyIdentifier: { type: String, index: true },
    partyName: String,
    supportedCurrencies: String
  },
  quoteRequest: QuoteRequestSchema,
  transferTerms: TransferTermsSchema,
  conversions: [ConversionSchema]
});

// Define the schema for settlement windows
const SettlementWindowSchema = new Schema({
  settlementWindowId: { type: Schema.Types.Int64, index: true }
});

// Define the schema for settlements
const SettlementSchema = new Schema({
  settlementWindows: [SettlementWindowSchema],
  settlementId: { type: Schema.Types.Int64, index: true },
  createdAt: Date,
  lastUpdatedAt: Date,
  settlementModel: String,
  settlementStatus: String
});

// Create models
const Transaction = mongoose.model('Transaction', TransactionSchema);
const Settlement = mongoose.model('Settlement', SettlementSchema);

module.exports = {
  Transaction,
  Settlement
};
```
