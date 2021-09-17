import { GraphQLResolveInfo } from 'graphql';
import { Context } from '@app/context';
import DataLoader from 'dataloader';

const findDfsps = async (ctx: Context, transferIds: string[], type: string) => {
  const dfsps = await ctx.centralLedger.transferParticipant.findMany({
    where: {
      transferId: {
        in: transferIds,
      },
      transferParticipantRoleType: {
        name: type,
      },
    },
    include: {
      participantCurrency: {
        include: {
          participant: true,
        },
      },
    },
  });
  return dfsps.map(({ transferId, participantCurrency: { participant } }) => ({
    transferId,
    id: participant.participantId,
    name: participant.name,
    description: participant.name,
    active: participant.isActive,
  }));
};

export const getDFSPDataloader = (ctx: Context, info: GraphQLResolveInfo, dfspType: string) => {
  const { loaders } = ctx;

  // initialize DataLoader for getting payers by transfer IDs
  let dl = loaders.get(info.fieldNodes);
  if (!dl) {
    dl = new DataLoader(async (transferIds: readonly string[]) => {
      // Get DFSP by Transfer IDs
      const dfsps = await findDfsps(ctx, transferIds as string[], dfspType);
      // IMPORTANT: sort data in the same order as transferIds
      return transferIds.map((tid) => dfsps.find((dfsp) => dfsp.transferId === tid));
    });
    // Put instance of dataloader in WeakMap for future reuse
    loaders.set(info.fieldNodes, dl);
  }
  return dl;
};
