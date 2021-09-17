import { extendType } from 'nexus';

const Query = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('dfsps', {
      type: 'DFSP',
      resolve: async (_parent, _args, ctx) => {
        const dfsps = await ctx.centralLedger.participant.findMany();
        return dfsps.map((dfsp) => ({
          id: dfsp.participantId,
          name: dfsp.name,
          description: dfsp.name,
          active: dfsp.isActive,
        }));
      },
    });
  },
});

export default [Query];
