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

const transferTermsID = Symbol();

const findTransferTerms = async (ctx: Context, transferIds: string[]) => {
  const entries = await ctx.eventStore.transferTerms.findMany({
    where: {
      transferId: {
        in: transferIds,
      },
    },
  });
  return Object.fromEntries(entries.map((e) => [e.transferId, e]));
};

export const getTransferTermsDataloader = (ctx: Context) => {
  const { loaders } = ctx;

  // initialize DataLoader for getting payers by transfer IDs
  let dl = loaders.get(transferTermsID);
  if (!dl) {
    dl = new DataLoader(async (transferIds: readonly string[]) => {
      const result = await findTransferTerms(ctx, transferIds as string[]);
      // IMPORTANT: sort data in the same order as transferIds
      return transferIds.map((tid) => result[tid]);
    });
    // Put instance of dataloader in WeakMap for future reuse
    loaders.set(transferTermsID, dl);
  }
  return dl;
};
