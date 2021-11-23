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
import * as keto from '@ory/keto-client';
import { parse, simplify } from 'graphql-parse-resolve-info';

export const createAuthMiddleware = (
  userIdHeader: string,
  oryKetoReadUrl?: string,
  authCheckParticipants?: boolean
) => {
  let oryKetoReadApi: keto.ReadApi;
  if (oryKetoReadUrl) {
    oryKetoReadApi = new keto.ReadApi(undefined, oryKetoReadUrl);
  }

  const opts = {
    validateStatus: () => true,
  };

  const getParticipantsByUserId = async (userId: string) => {
    const response = await oryKetoReadApi.getRelationTuples('participant', undefined, 'member', userId);
    return response.data.relation_tuples?.map(({ object }) => object);
  };

  const checkPermission = async (userId: string, obj: string) => {
    const response = await oryKetoReadApi.getCheck('permission', obj, 'granted', userId, opts);
    return response.data.allowed;
  };

  const isAuthenticated = rule()(async (parent, args, ctx, info) => {
    if (!oryKetoReadApi) {
      return true;
    }
    const userId = ctx.req.headers[userIdHeader];

    if (authCheckParticipants) {
      ctx.participants = await getParticipantsByUserId(userId);
    }

    const parsedInfo = parse(info);
    const simplifiedInfo = simplify(parsedInfo as any, info.returnType);
    const fields = Object.keys(simplifiedInfo.fields);

    const grants = await Promise.all(fields.map((field) => checkPermission(userId, `${simplifiedInfo.name}.${field}`)));
    return !grants.some((grant) => !grant);
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
