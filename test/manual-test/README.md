- Run `docker-compose up` to start mysql and mongodb
- Import the mysql dump file `sample_mysql_data.sql` into `central_ledger` database
- Start the service using `npm start`
- Open http://localhost:3000 for graphql playground and enter the following query and query variables.

Query:
```
query GetTransfersWithEvents($startDate: DateTimeFlexible!, $endDate: DateTimeFlexible!, $currency: Currency, $transferState: TransferState, $payeeFSPId: String, $payerFSPId: String, $payeeIdType: PartyIDType, $payerIdType: PartyIDType, $payeeIdValue: String, $payerIdValue: String) {
  transfers(
    filter: {startDate: $startDate, endDate: $endDate, currency: $currency, transferState: $transferState, payer: {dfsp: $payerFSPId, idType: $payerIdType, idValue: $payerIdValue}, payee: {dfsp: $payeeFSPId, idType: $payeeIdType, idValue: $payeeIdValue}}
  ) {
    errorCode
    transferId
    transferState
    transactionType
    currency
    amount
    settlementId
    createdAt
    quoteId
    partyLookupEvents
    quoteEvents
    transferEvents
    settlementEvents
    payeeDFSP {
      id
      name
      description
      __typename
    }
    payerDFSP {
      id
      name
      description
      __typename
    }
    payerParty {
      id
      firstName
      lastName
      middleName
      dateOfBirth
      idType
      idValue
      __typename
    }
    payeeParty {
      id
      firstName
      lastName
      middleName
      dateOfBirth
      idType
      idValue
      __typename
    }
    __typename
  }
}
```

Query Variables:
```
{
    "startDate": "Sun Jan 01 2023 14:32:35 GMT+0530",
    "endDate": "Mon Apr 03 2023 14:32:35 GMT+0530"
}
```


