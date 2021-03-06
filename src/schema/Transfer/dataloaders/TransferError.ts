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

const findTransferErrors = async (ctx: Context, transferIds: string[]) => {
  const trStates = await ctx.centralLedger.transferError.findMany({
    where: {
      transferId: {
        in: transferIds,
      },
    },
    select: {
      transferId: true,
      errorCode: true,
    },
  });
  return Object.fromEntries(trStates.map((e) => [e.transferId, e.errorCode]));
};

export const getTransferErrorDataloader = (ctx: Context) => {
  const { loaders } = ctx;

  // initialize DataLoader for getting payers by transfer IDs
  let dl = loaders.get(ID);
  if (!dl) {
    dl = new DataLoader(async (transferIds: readonly string[]) => {
      const states = await findTransferErrors(ctx, transferIds as string[]);
      // IMPORTANT: sort data in the same order as transferIds
      return transferIds.map((tid) => states[tid]);
    });
    // Put instance of dataloader in WeakMap for future reuse
    loaders.set(ID, dl);
  }
  return dl;
};
