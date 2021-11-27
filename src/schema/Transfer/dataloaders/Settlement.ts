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
  const result = await ctx.centralLedger.settlementSettlementWindow.findMany({
    where: {
      settlementWindow: {
        transferFulfilment: {
          some: {
            transferId: {
              in: transferIds,
            },
          },
        },
      },
    },
    include: {
      settlementWindow: {
        select: {
          transferFulfilment: {
            select: {
              transferId: true,
            },
          },
        },
      },
    },
  });
  return Object.fromEntries(result.map((e) => [e.settlementWindow.transferFulfilment[0]?.transferId, e]));
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
