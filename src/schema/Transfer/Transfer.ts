import { objectType } from 'nexus';

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
    t.string('transferState');
    t.list.field('transferStateChanges', { type: 'JSONObject' }); 
    t.string('transactionType');
    t.int('errorCode');
    t.string('transferSettlementWindowId');
    t.string('payerDFSP');
    t.string('payerDFSPProxy');
    t.string('payeeDFSP');
    t.string('payeeDFSPProxy');
    t.field('positionChanges', { type: 'JSONObject' });
    t.field('payerParty', { type: 'JSONObject' });
    t.field('payeeParty', { type: 'JSONObject' });
    t.field('quoteRequest', { type: 'JSONObject' });
    t.field('transferTerms', { type: 'JSONObject' });
    t.field('conversions', { type: 'JSONObject' });
  },
});

export default [Transfer];
