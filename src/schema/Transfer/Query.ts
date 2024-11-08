import { arg, extendType, inputObjectType, intArg, nonNull, stringArg } from 'nexus';

const Query = extendType({
  type: 'Query',
  definition(t) {
    t.field('transfers', {
      type: 'Transfer',
      args: {
        transferId: nonNull(stringArg()),
      },
      resolve: async (parent, args, ctx) => {
        console.log("Transfer resolver called for transferId", args.transferId);
        const transaction = await ctx.transaction.transaction.findUnique({
          where: {
            transferId: args.transferId,
          },
        });
        if (!transaction) {
          console.log('no transaction found ');
          return null;
        }
        console.log('transaction data:',transaction);
        return transaction;
      },
    });
  },
});

export default Query;
