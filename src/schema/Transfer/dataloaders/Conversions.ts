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

const conversionsID  = Symbol();

const findConversions = async (ctx: Context, transferIds: string[]) => {
  const entries = await ctx.centralLedger.conversions.findMany({
    where: {
      transferId: {
        in: transferIds,
      },
    },
  });
  return Object.fromEntries(entries.map((e) => [e.transferId, e]));
};

export const  getConversionsDataloader = (ctx: Context) => {
  const { loaders } = ctx;

  // initialize DataLoader for getting payers by transfer IDs
  let dl = loaders.get(conversionsID);
  if (!dl) {
    dl = new DataLoader(async (transferIds: readonly string[]) => {
      const results = await findConversions(ctx, transferIds as string[]);
      // IMPORTANT: sort data in the same order as transferIds
      return transferIds.map((tid) => results[tid]);
    });
    // Put instance of dataloader in WeakMap for future reuse
    loaders.set(conversionsID, dl);
  }
  return dl;
};
