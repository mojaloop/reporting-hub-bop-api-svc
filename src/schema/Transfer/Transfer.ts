import { objectType } from 'nexus';

const TransferStateChange = objectType({
  name: 'TransferStateChange',
  definition(t) {
    t.nonNull.string('transferState');

    t.nonNull.dateTime('dateTime', {
      resolve: (parent) => {
        const date = parent.dateTime;
        if (date && typeof date === 'object' && date.$date) {
          return new Date(date.$date).toISOString();
        }
        return date ? new Date(date).toISOString() : null;
      },
    });

    t.string('reason');
  },
});

const Transfer = objectType({
  name: 'Transfer',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('transferId');
    t.string('transactionId');
    t.decimal('sourceAmount');
    t.string('sourceCurrency');
    t.decimal('targetAmount');
    t.string('targetCurrency');
    t.dateTime('createdAt'); 
    t.dateTime('lastUpdated');
    t.string('transferState');
    t.string('transactionType');
    t.int('errorCode');
    t.string('transferSettlementWindowId');
    t.string('payerDFSP');
    t.string('payerDFSPProxy');
    t.string('payeeDFSP');
    t.string('payeeDFSPProxy');
    t.field('payerParty', { type: 'JSONObject' });
    t.field('payeeParty', { type: 'JSONObject' });
    t.field('quoteRequest', { type: 'JSONObject' });
    t.field('transferTerms', { type: 'JSONObject' });

    t.list.field('positionChanges', { type: 'JSONObject' });

    t.list.field('transferStateChanges', {
      type: 'TransferStateChange',
      resolve: (parent) => {
        const transferStateChanges = parent.transferStateChanges;

        if (typeof transferStateChanges === 'string') {
          try {
            return JSON.parse(transferStateChanges);
          } catch (error) {
            console.error('Error parsing transferStateChanges:', error);
            return [];
          }
        }

        return transferStateChanges || [];
      },
    });

    t.list.field('conversions', { type: 'JSONObject' });
  },
});

export default [Transfer, TransferStateChange];
