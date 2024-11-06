"use strict";
/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthMiddleware = void 0;
const graphql_shield_1 = require("graphql-shield");
const keto = __importStar(require("@ory/keto-client"));
const graphql_parse_resolve_info_1 = require("graphql-parse-resolve-info");
const createAuthMiddleware = (userIdHeader, oryKetoReadUrl, authCheckParticipants) => {
    let oryKetoReadApi;
    if (oryKetoReadUrl) {
        oryKetoReadApi = new keto.ReadApi(undefined, oryKetoReadUrl);
    }
    const opts = {
        validateStatus: () => true,
    };
    const getParticipantsByUserId = async (userId) => {
        const response = await oryKetoReadApi.getRelationTuples('participant', undefined, 'member', userId);
        return response.data.relation_tuples?.map(({ object }) => object);
    };
    const checkPermission = async (userId, obj) => {
        const response = await oryKetoReadApi.getCheck('permission', obj, 'granted', userId, opts);
        return response.data.allowed;
    };
    const isAuthenticated = (0, graphql_shield_1.rule)()(async (parent, args, ctx, info) => {
        if (!oryKetoReadApi) {
            return true;
        }
        const userId = ctx.req.headers[userIdHeader];
        if (authCheckParticipants) {
            ctx.participants = await getParticipantsByUserId(userId);
        }
        const parsedInfo = (0, graphql_parse_resolve_info_1.parse)(info);
        const simplifiedInfo = (0, graphql_parse_resolve_info_1.simplify)(parsedInfo, info.returnType);
        const fields = Object.keys(simplifiedInfo.fields);
        const grants = await Promise.all(fields.map((field) => checkPermission(userId, `${simplifiedInfo.name}.${field}`)));
        return !grants.some((grant) => !grant);
    });
    return (0, graphql_shield_1.shield)({
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
    }, {
        allowExternalErrors: true,
    });
};
exports.createAuthMiddleware = createAuthMiddleware;
//# sourceMappingURL=auth.js.map