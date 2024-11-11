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

type PartyType = 'PAYER' | 'PAYEE' | 'PARTY_LOOKUP' | 'QUOTE' | 'SETTLEMENT' | 'TRANSFER';

const ID = (type: PartyType) => Symbol.for(`PARTY_DL_${type}`);

const findParties = async (ctx: Context, transferIds: string[], type: PartyType) => {
  console.log("Inside findParties for transferIds",transferIds);
  const transfers = await ctx.transaction.transaction.findMany({
    where: {
      transferId: {
        in: transferIds,
      },
    },
    select: {
      transferId: true,
      payerParty: {
        select: {
          id: true,
          partyIdType: true,
          partyIdentifier: true,
          partyName: true,
          supportedCurrencies: true,
        },
      },
      payeeParty: {
        select: {
          id: true,
          partyIdType: true,
          partyIdentifier: true,
          partyName: true,
          supportedCurrencies: true,
        },
      },
    },
  });

  console.log("Inside findParties transfers",transfers);
  return Object.fromEntries(
    transfers.map((t) => {
      // Determine the correct party based on the type
      const party = type === 'PAYER' ? t.payerParty : t.payeeParty;
      return [
        t.transferId,
        {
          id: party?.id,
          partyIdType: party?.partyIdType,
          partyIdentifier: party?.partyIdentifier,
          partyName: party?.partyName,
          supportedCurrencies: party?.supportedCurrencies,
        },
      ];
    })
  );
};

export const getPartyDataloader = (ctx: Context, partyType: PartyType) => {
  const { loaders } = ctx;

  // Initialize DataLoader for getting parties by transfer IDs
  let dl = loaders.get(ID(partyType));
  if (!dl) {
    dl = new DataLoader(async (transferIds: readonly string[]) => {
      // Get parties by Transfer IDs
      const parties = await findParties(ctx, transferIds as string[], partyType);
      // Sort data in the same order as transferIds
      return transferIds.map((id) => parties[id]);
    });
    // Store DataLoader instance in WeakMap for future reuse
    loaders.set(ID(partyType), dl);
  }
  return dl;
};
