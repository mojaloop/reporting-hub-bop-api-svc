import { objectType } from 'nexus';

const TransferSummary = objectType({
  name: 'TransferSummary',
  definition(t) {
    t.nonNull.int('count');
    t.nonNull.int('amount');
    t.field('errorCode', { type: 'String' });
    t.field('payer', { type: 'String' });
    t.field('payee', { type: 'String' });
    t.field('currency', { type: 'String' });
    // t.nonNull.list.nonNull.field('dfsps', {
    //   type: 'DFSP',
    //   resolve: (parent, _, context) =>
    //     context.centralLedger.membership
    //       .findUnique({
    //         where: {
    //           id: parent.id,
    //         },
    //       })
    //       .user(),
    // });
  },
});

export default [TransferSummary];
