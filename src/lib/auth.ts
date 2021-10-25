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
import keto from '@ory/keto-client';
import jwt_decode from 'jwt-decode';
import { parse, simplify } from 'graphql-parse-resolve-info';

export const createAuthMiddleware = (oryKetoReadUrl?: string) => {
  let oryKetoReadApi: keto.ReadApi;
  if (oryKetoReadUrl) {
    oryKetoReadApi = new keto.ReadApi(undefined, oryKetoReadUrl);
  }

  const getParticipantsByUserId = async (userId: string) => {
    const response = await oryKetoReadApi.getRelationTuples(
      'participant',
      undefined,
      undefined,
      undefined,
      'member',
      userId
    );
    return response.data.relation_tuples?.map(({ object }) => object);
  };

  const checkPermission = async (userId: string, obj: string) => {
    const response = await oryKetoReadApi.getCheck('permission', obj, 'access', userId);
    return response.data.allowed;
  };

  const isAuthenticated = rule()(async (parent, args, ctx, info) => {
    if (!oryKetoReadApi) {
      return true;
    }
    const { userId } = jwt_decode(ctx.req.headers.token_id) as any;

    ctx.participants = await getParticipantsByUserId(userId);

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
