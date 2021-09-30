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
import axios from 'axios';

export const createAuthMiddleware = (authApi?: string) => {
  const isAuthenticated = rule()(async (parent, args, ctx, info) => {
    if (!authApi) {
      return true;
    }
    // TODO: Call Keto auth endpoint
    const result = await axios.get(authApi, {
      // user: ctx.user,
    });
    return result.status == 200;
  });

  return shield(
    {
      Query: {
        transfers: isAuthenticated,
        transferSummary: isAuthenticated,
      },
      Transfer: isAuthenticated,
    },
    {
      allowExternalErrors: true,
    }
  );
};
