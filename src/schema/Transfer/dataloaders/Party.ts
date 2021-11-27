/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { Context } from '@app/context';
import DataLoader from 'dataloader';

type PartyType = 'PAYEE' | 'PAYER';

const ID = (type: PartyType) => Symbol.for(`PARTY_DL_${type}`);

const findParties = async (ctx: Context, transferIds: string[], type: PartyType) => {
  const result = await ctx.centralLedger.party.findMany({
    where: {
      quoteParty: {
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
    },
    include: {
      quoteParty: {
        select: {
          partyIdentifierType: true,
          partyIdentifierValue: true,
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
      },
    },
  });
  return Object.fromEntries(
    result.map((e) => [
      e.quoteParty.quote.transfer.transferId,
      {
        id: e.partyId,
        firstName: e.firstName,
        lastName: e.lastName,
        middleName: e.middleName,
        dateOfBirth: e.dateOfBirth,
        idType: e.quoteParty.partyIdentifierType.name,
        idValue: e.quoteParty.partyIdentifierValue,
      },
    ])
  );
};

export const getPartyDataloader = (ctx: Context, partyType: PartyType) => {
  const { loaders } = ctx;

  // initialize DataLoader for getting payers by transfer IDs
  let dl = loaders.get(ID(partyType));
  if (!dl) {
    dl = new DataLoader(async (transferIds: readonly string[]) => {
      // Get DFSP by Transfer IDs
      const parties = await findParties(ctx, transferIds as string[], partyType);
      // IMPORTANT: sort data in the same order as transferIds
      return transferIds.map((id) => parties[id]);
    });
    // Put instance of dataloader in WeakMap for future reuse
    loaders.set(ID(partyType), dl);
  }
  return dl;
};
