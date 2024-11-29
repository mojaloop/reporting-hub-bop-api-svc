import { extendType, nonNull, intArg } from 'nexus';

const Query = extendType({
  type: 'Query',
  definition(t) {
    t.field('settlement', {
      type: 'Settlement',
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (parent, args, ctx): Promise<any> => {
        try {
          const settlement = await ctx.settlement.settlement.findFirst({
            where: {
              settlementWindows: {
                some: {
                  settlementWindowId: args.id,
                },
              },
            },
          });

          if (!settlement) {
            console.log(`No settlement found for settlementId: ${args.id}`);
            return null;
          }

          return settlement;
        } catch (error) {
          console.error(`Error fetching settlement with settlementId: ${args.id}`, error);
          throw new Error('Error fetching settlement data');
        }
      },
    });

    t.nonNull.list.nonNull.field('settlements', {
      type: 'Settlement',
      resolve: async (parent, args, ctx): Promise<any> => {
        try {
          // Fetch multiple settlements with pagination and filtering
          const settlements = await ctx.settlement.settlement.findMany({});

          if (settlements.length === 0) {
            console.log(`No settlements found`);
          }
          return settlements;
        } catch (error) {
          console.error('Error fetching transfers', error);
          throw new Error('Error fetching transfers data');
        }
      },
    });
  },
});

export default Query;
