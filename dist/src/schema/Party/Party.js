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
const PartyIDType = (0, nexus_1.enumType)({
    name: 'PartyIDType',
    members: ['MSISDN', 'EMAIL', 'PERSONAL_ID', 'BUSINESS', 'DEVICE', 'ACCOUNT_ID', 'IBAN', 'ALIAS'],
});
const Party = (0, nexus_1.objectType)({
    name: 'Party',
    definition(t) {
        t.bigInt('id');
        t.string('firstName');
        t.string('lastName');
        t.string('middleName');
        t.date('dateOfBirth');
        t.field('idType', { type: 'PartyIDType' });
        t.string('idValue');
        // t.nonNull.string('dfsp');
    },
});
exports.default = [Party, PartyIDType];
//# sourceMappingURL=Party.js.map