/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { GraphQLResolveInfo } from 'graphql';
import { Context } from '@app/context';
import DataLoader from 'dataloader';

type PartyType = 'PAYEE' | 'PAYER';

const findParties = async (ctx: Context, transferIds: string[], type: PartyType) => {
  const quoteParty = await ctx.centralLedger.quoteParty.findMany({
    where: {
      quote: {
        transfer: {
          transferId: {
            in: transferIds,
          },
        },
      },
      partyType: {
        name: type,
      },
    },
    include: {
      partyIdentifierType: true,
      party: true,
      quote: {
        select: {
          transfer: {
            select: {
              transferId: true,
            },
          },
        },
      },
    },
  });
  return quoteParty.map((qp) => ({
    transferId: qp.quote.transfer.transferId,
    // dfsp: qp.fspId,
    firstName: qp.party[0]?.firstName,
    lastName: qp.party[0]?.lastName,
    middleName: qp.party[0]?.middleName,
    dateOfBirth: qp.party[0]?.dateOfBirth,
    idType: qp.partyIdentifierType.name,
    idValue: qp.partyIdentifierValue,
  }));
};

export const getPartyDataloader = (ctx: Context, info: GraphQLResolveInfo, partyType: PartyType) => {
  const { loaders } = ctx;

  // initialize DataLoader for getting payers by transfer IDs
  let dl = loaders.get(info.fieldNodes);
  if (!dl) {
    dl = new DataLoader(async (transferIds: readonly string[]) => {
      // Get DFSP by Transfer IDs
      const parties = await findParties(ctx, transferIds as string[], partyType);
      // IMPORTANT: sort data in the same order as transferIds
      return transferIds.map((tid) => parties.find((party) => party.transferId === tid));
    });
    // Put instance of dataloader in WeakMap for future reuse
    loaders.set(info.fieldNodes, dl);
  }
  return dl;
};
