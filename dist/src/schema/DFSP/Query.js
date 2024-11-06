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
Object.defineProperty(exports, "__esModule", { value: true });
const nexus_1 = require("nexus");
const Query = (0, nexus_1.extendType)({
    type: 'Query',
    definition(t) {
        t.nonNull.list.nonNull.field('dfsps', {
            type: 'DFSP',
            resolve: async (_parent, _args, ctx) => {
                const dfsps = await ctx.centralLedger.participant.findMany();
                return dfsps.map((dfsp) => ({
                    id: dfsp.participantId,
                    name: dfsp.name,
                    description: dfsp.name,
                    active: dfsp.isActive,
                }));
            },
        });
    },
});
exports.default = [Query];
//# sourceMappingURL=Query.js.map