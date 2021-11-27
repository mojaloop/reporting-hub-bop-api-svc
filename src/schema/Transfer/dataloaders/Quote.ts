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
import { quote } from '@app/generated/centralLedger';

const ID = Symbol();

const findQuotes = async (ctx: Context, transferIds: string[]) => {
  const entries = await ctx.centralLedger.quote.findMany({
    where: {
      transfer: {
        transferId: {
          in: transferIds,
        },
      },
    },
    include: {
      transfer: {
        select: {
          transferId: true,
        },
      },
    },
  });
  return Object.fromEntries(entries.map((e) => [e.transfer.transferId, e]));
};

export const getQuotesDataloader = (ctx: Context): DataLoader<string, quote> => {
  const { loaders } = ctx;

  // initialize DataLoader for getting payers by transfer IDs
  let dl = loaders.get(ID);
  if (!dl) {
    dl = new DataLoader(async (transferIds: readonly string[]) => {
      const quotes = await findQuotes(ctx, transferIds as string[]);
      // IMPORTANT: sort data in the same order as transferIds
      return transferIds.map((tid) => quotes[tid]);
    });
    // Put instance of dataloader in WeakMap for future reuse
    loaders.set(ID, dl);
  }
  return dl;
};
