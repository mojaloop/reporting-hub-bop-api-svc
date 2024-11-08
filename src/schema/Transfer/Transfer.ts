import { enumType, objectType } from 'nexus';

const Transfer = objectType({
  name: 'Transfer',
  definition(t) {
    t.nonNull.string('transferId');
    t.string('transactionId');
    t.decimal('sourceAmount');
    t.string('sourceCurrency');
    t.decimal('targetAmount');
    t.string('targetCurrency');
    t.string('createdAt');
    t.string('lastUpdated');
    t.string('transferState'); // Simple string field
    // TODO: transaferStateChanges array
    t.string('transactionType'); // Simple string field
    t.int('errorCode'); // Integer field Maybe a JSON type
    t.string('transferSettlementWindowId'); // BigInt field
    t.string('payerDFSP');
    t.string('payerDFSPProxy');
    t.string('payeeDFSP');
    t.string('payeeDFSPProxy');
    // TODO pos changes jsonObject
    t.field('payerParty', { type: 'Party' }); // TODO update and check party model once
    t.field('payeeParty', { type: 'Party' });
    t.list.jsonObject('quoteRequest'); // TODO create a quoteRequest type
    t.list.jsonObject('transferTerms'); // TODO create a quoteRequest type
    // t.list.jsonObject('conversions'); // TODO
    t.list.jsonObject('partyLookupEvents');
    t.list.jsonObject('quoteEvents');
    t.list.jsonObject('transferEvents');
    t.list.jsonObject('settlementEvents');
  },
});

export default [Transfer];
