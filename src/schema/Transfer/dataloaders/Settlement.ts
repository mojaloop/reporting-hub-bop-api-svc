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
import { settlementSettlementWindow } from '@app/generated/centralLedger';

const ID = Symbol();

const findSettlements = async (ctx: Context, transferIds: string[]) => {
  const transfers = await ctx.centralLedger.transfer.findMany({
    where: {
      transferId: {
        in: transferIds,
      },
    },
    select: {
      transferId: true,
      transferFulfilment: {
        select: {
          settlementWindow: {
            select: {
              settlementSettlementWindow: true,
            },
          },
        },
      },
    },
  });
  return Object.fromEntries(
    transfers.map((e) => [e.transferId, e.transferFulfilment[0]?.settlementWindow?.settlementSettlementWindow[0]])
  );
};

export const getSettlementDataloader = (ctx: Context): DataLoader<string, settlementSettlementWindow> => {
  const { loaders } = ctx;

  // initialize DataLoader for getting payers by transfer IDs
  let dl = loaders.get(ID);
  if (!dl) {
    dl = new DataLoader(async (transferIds: readonly string[]) => {
      const results = await findSettlements(ctx, transferIds as string[]);
      // IMPORTANT: sort data in the same order as transferIds
      return transferIds.map((id) => results[id]);
    });
    // Put instance of dataloader in WeakMap for future reuse
    loaders.set(ID, dl);
  }
  return dl;
};
