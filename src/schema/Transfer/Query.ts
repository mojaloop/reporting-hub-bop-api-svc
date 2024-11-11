import { arg, extendType, inputObjectType, intArg, nonNull, stringArg, list } from 'nexus';

const Query = extendType({
  type: 'Query',
  definition(t) {
    t.field('transfers', {
      type: 'Transfer',
      args: {
        transferId: nonNull(stringArg()),
      },
      resolve: async (parent, args, ctx) => {
        console.log('Transfer resolver called for transferId', args.transferId);
        const transaction = await ctx.transaction.transaction.findUnique({
          where: {
            transferId: args.transferId,
          },
        });
        if (!transaction) {
          console.log('no transaction found ');
          return null;
        }
        console.log('transaction data:', transaction);
        return transaction;
      },
    });
    t.nonNull.list.nonNull.field('getAllTransfers', {
      type: 'Transfer',
      args: {
        limit: intArg(),
        offset: intArg(),
      },
      resolve: async (parent, args, ctx) => {
        const { limit = 10, offset = 0 } = args;
        console.log(`Fetching transfers with limit ${limit} and offset ${offset}`);
        const transfers = await ctx.transaction.transaction.findMany({
          skip: offset ?? 0,
          take: limit ?? 5,
          orderBy: {
            createdAt: 'desc',
          },
        });

        console.log('Transfers fetched with pagination:', transfers);
        return transfers;
      },
    });
  },
});

export default Query;
