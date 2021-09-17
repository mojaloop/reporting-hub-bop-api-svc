import { objectType } from 'nexus';
import { getDFSPDataloader } from './utils';

const Transfer = objectType({
  name: 'Transfer',
  definition(t) {
    t.nonNull.string('transferId');
    t.nonNull.int('amount');
    t.nonNull.string('currency');
    t.nonNull.string('createdAt');
    t.field('payer', {
      type: 'DFSP',
      resolve: (parent, _, ctx, info) => {
        const dl = getDFSPDataloader(ctx, info, 'PAYER_DFSP');
        return dl.load(parent.transferId);
      },
    });
    t.field('payee', {
      type: 'DFSP',
      resolve: async (parent, _, ctx, info) => {
        const dl = getDFSPDataloader(ctx, info, 'PAYEE_DFSP');
        return dl.load(parent.transferId);
      },
    });
  },
});

export default [Transfer];
