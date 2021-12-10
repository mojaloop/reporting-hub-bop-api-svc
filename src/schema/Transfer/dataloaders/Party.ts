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
  const transfers = await ctx.centralLedger.transfer.findMany({
    where: {
      transferId: {
        in: transferIds,
      },
      quote: {
        some: {
          quoteParty: {
            some: {
              partyType: {
                name: type,
              },
            },
          },
        },
      },
    },
    select: {
      transferId: true,
      quote: {
        select: {
          quoteParty: {
            select: {
              partyIdentifierType: true,
              partyIdentifierValue: true,
              party: true,
            },
          },
        },
      },
    },
  });
  return Object.fromEntries(
    transfers.map((t) => {
      const qp = t.quote[0]?.quoteParty[0];
      const p = qp?.party[0];
      return [
        t.transferId,
        {
          id: p?.partyId,
          firstName: p?.firstName,
          lastName: p?.lastName,
          middleName: p?.middleName,
          dateOfBirth: p?.dateOfBirth,
          idType: qp?.partyIdentifierType?.name,
          idValue: qp?.partyIdentifierValue,
        },
      ];
    })
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
