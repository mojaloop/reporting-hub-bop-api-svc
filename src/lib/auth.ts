/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { rule, shield } from 'graphql-shield';
import type { Guard } from '@mojaloop/authz';

/** The resource type transfer rows belong to, as the API document spells it. */
const PARTICIPANT_RESOURCE = 'participants';

export const createAuthMiddleware = (authz: Guard) => {
  const isAuthenticated = rule()(async (parent, args, ctx) => {
    const participants = authz(ctx.req, PARTICIPANT_RESOURCE);
    // What a resolver narrows its rows by
    ctx.participants = participants;

    // Every query here answers over the whole collection: a list of transfers
    // and an aggregate across them, neither computed per participant. A
    // caller holding some of them can only be answered once the resolvers
    // narrow by ctx.participants.
    if (participants.restricted) return new Error('this service answers hub-wide queries only');
    return true;
  });

  return shield(
    {
      Query: {
        transfers: isAuthenticated,
        transferSummary: isAuthenticated,
      },
      // Transfer: isAuthenticated,
      // Field level permission can be added as well
      // Transfer: {
      //   transferId: isItemOwner,
      //   settlementEvents: isItemOwner,
      // },
      // TransferSummary: {
      //   errorCode: isAuthenticated,
      //   payerDFSP: isAuthenticated,
      //   payeeDFSP: isAuthenticated,
      //   currency: isAuthenticated,
      // },
    },
    {
      allowExternalErrors: true,
    }
  );
};
