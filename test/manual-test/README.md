## Deploying the service along with ML Core Test Harness
- Download and run `ml-core-test-harness`
```
git clone https://github.com/mojaloop/ml-core-test-harness.git
cd ml-core-test-harness
docker-compose --profile all-services --profile ttk-provisioning --profile ttk-tests up
```
- Wait for tests to be run
- Start the service using the following commands in a new terminal
```
npm install
npm run generate
npm start
```

## Running a sample query using graphql playground

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

Variables:
```
{
    "startDate": "Sun Jan 01 2023 14:32:35 GMT+0530",
    "endDate": "Mon Jan 01 2024 14:32:35 GMT+0530"
}
```

## Viewing the transfers in transfer UI
- In a new terminal run `docker-compose up` to start transfers UI service
- Open `http://localhost:8082` in browser
- Click on `Find Transfers` and the transfers executed through `ML Core Test Harness` should be visible