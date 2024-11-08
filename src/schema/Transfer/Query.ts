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
        const transaction = await ctx.transaction.transaction.findMany({
          where: {
            transferId: args.transferId,
          },
        });
        if (!transaction) {
          console.log('NO event found ');
          return null;
        }
        console.log('event',transaction);
      },
    });
  },
});

export default Query;
