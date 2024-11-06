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
const TransferSummary = (0, nexus_1.objectType)({
    name: 'TransferSummary',
    definition(t) {
        t.nonNull.bigInt('count');
        t.nonNull.decimal('amount');
        t.field('errorCode', { type: 'Int' });
        t.field('payerDFSP', { type: 'String' });
        t.field('payeeDFSP', { type: 'String' });
        t.field('currency', { type: 'Currency' });
        // t.nonNull.list.nonNull.field('dfsps', {
        //   type: 'DFSP',
        //   resolve: (parent, _, context) =>
        //     context.centralLedger.membership
        //       .findUnique({
        //         where: {
        //           id: parent.id,
        //         },
        //       })
        //       .user(),
        // });
    },
});
exports.default = [TransferSummary];
//# sourceMappingURL=TransferSummary.js.map