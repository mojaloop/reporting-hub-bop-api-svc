import { arg, extendType, inputObjectType, intArg } from 'nexus';

const TransferFilter = inputObjectType({
  name: 'TransferFilter',
  definition(t) {
    t.field('startDate', { type: 'DateTime' });
    t.field('endDate', { type: 'DateTime' });
    t.field('errorCode', { type: 'Int' });
    t.field('payer', { type: 'String' });
    t.field('payee', { type: 'String' });
    t.field('currency', { type: 'String' });
  },
});

const Query = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('transfers', {
      type: 'Transfer',
      args: {
        filter: arg({ type: 'TransferFilter' }),
        limit: intArg(),
      },
      resolve: async (parent, args, ctx) => {
        const transfers = await ctx.centralLedger.transfer.findMany({
          take: args.limit ?? 100,
          orderBy: [{ createdDate: 'desc' }],
          where: {
            createdDate: {
              gte: args.filter?.startDate || undefined,
              lt: args.filter?.endDate || undefined,
            },
            currencyId: args.filter?.currency || undefined,
            transferStateChange: {
              some: {
                transferError: {
                  some: {
                    errorCode: args.filter?.errorCode || undefined,
                  },
                },
              },
            },
            transferParticipant: {
              every: {
                OR: [
                  {
                    transferParticipantRoleType: {
                      name: 'PAYEE_DFSP',
                    },
                    participantCurrency: {
                      participant: {
                        name: args.filter?.payee || undefined,
                      },
                    },
                  },
                  {
                    transferParticipantRoleType: {
                      name: 'PAYER_DFSP',
                    },
                    participantCurrency: {
                      participant: {
                        name: args.filter?.payer || undefined,
                      },
                    },
                  },
                ],
              },
            },
          },
        });
        return transfers.map((tr) => ({
          transferId: tr.transferId,
          amount: tr.amount.toNumber(),
          currency: tr.currencyId,
          createdAt: tr.createdDate.toISOString(),
        }));
      },
    });
  },
});

export default [Query, TransferFilter];
