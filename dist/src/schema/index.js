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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("tsconfig-paths/register");
const nexus_1 = require("nexus");
const path_1 = require("path");
const Scalar_1 = __importDefault(require("./Scalar"));
const DFSP_1 = __importDefault(require("./DFSP"));
const Transfer_1 = __importDefault(require("./Transfer"));
const Party_1 = __importDefault(require("./Party"));
const TransferSummary_1 = __importDefault(require("./TransferSummary"));
const types = [Scalar_1.default, DFSP_1.default, Transfer_1.default, Party_1.default, TransferSummary_1.default];
const Query = (0, nexus_1.queryType)({
    definition(t) {
        t.field('_placeholder', {
            type: 'Boolean',
        });
    },
});
const Mutation = (0, nexus_1.mutationType)({
    definition(t) {
        t.field('_placeholder', {
            type: 'Boolean',
        });
    },
});
exports.default = (0, nexus_1.makeSchema)({
    types: [Query, Mutation, types.flat()],
    outputs: process.env.NODE_ENV !== 'production' && {
        typegen: (0, path_1.join)((0, path_1.dirname)(require.resolve('@app/index')), '../node_modules/@types/nexus-typegen/index.d.ts'),
        schema: (0, path_1.join)((0, path_1.dirname)(require.resolve('@app/index')), '../node_modules/@types/nexus-typegen/schema.graphql'),
    },
    contextType: {
        module: '@app/context',
        export: 'Context',
    },
    sourceTypes: {
        modules: [
            {
                module: '@prisma/client',
                alias: 'prisma',
            },
        ],
    },
});
//# sourceMappingURL=index.js.map