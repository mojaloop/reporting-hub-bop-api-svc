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

const ID = Symbol();

const findTransferStates = async (ctx: Context, transferIds: string[]) => {
  console.log("findTransferStates for transferIds", transferIds);
  const trStates = await ctx.transaction.transaction.findMany({
    where: {
      transferId: {
        in: transferIds,
      },
    },
    select: {
      transferId: true,
      transferStateChanges:{
        select: {
          transferState: true,
          dateTime: true,
          reason: true,
        },
      },
    },
  });
  console.log("findTransferStates trStates", trStates);
  
  return Object.fromEntries(trStates.map((e) => [e.transferId, e.transferStateChanges
  ]));
};

export const getTransferStateDataloader = (ctx: Context) => {
  const { loaders } = ctx;

  // initialize DataLoader for getting transfer states by transfer IDs
  let dl = loaders.get(ID);
  if (!dl) {
    dl = new DataLoader(async (transferIds: readonly string[]) => {
      const states = await findTransferStates(ctx, transferIds as string[]);
      // Handle missing transfer states by returning null for unmatched IDs
      return transferIds.map((tid) => states[tid] || null);
    });
    // Store DataLoader instance in WeakMap for reuse
    loaders.set(ID, dl);
  }
  return dl;
};
