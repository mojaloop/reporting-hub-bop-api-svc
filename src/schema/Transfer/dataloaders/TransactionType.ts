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
import { transactionScenario } from '@app/generated/centralLedger';

const ID = Symbol();

const findTransactionTypes = async (ctx: Context, transactionScenarioIds: number[]) => {
  const entries = await ctx.centralLedger.transactionScenario.findMany({
    where: {
      transactionScenarioId: {
        in: transactionScenarioIds,
      },
    },
  });
  return Object.fromEntries(entries.map((e) => [e.transactionScenarioId, e]));
};

export const getTransactionTypeDataloader = (ctx: Context): DataLoader<number, transactionScenario> => {
  const { loaders } = ctx;

  // initialize DataLoader for getting payers by transfer IDs
  let dl = loaders.get(ID);
  if (!dl) {
    dl = new DataLoader(async (transactionScenarioIds: readonly number[]) => {
      const result = await findTransactionTypes(ctx, transactionScenarioIds as number[]);
      // IMPORTANT: sort data in the same order as transferIds
      return transactionScenarioIds.map((id) => result[id]);
    });
    // Put instance of dataloader in WeakMap for future reuse
    loaders.set(ID, dl);
  }
  return dl;
};
