/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { enumType, objectType } from 'nexus';

const PartyIDType = enumType({
  name: 'PartyIDType',
  members: ['MSISDN', 'EMAIL', 'PERSONAL_ID', 'BUSINESS', 'DEVICE', 'ACCOUNT_ID', 'IBAN', 'ALIAS'],
});

const Party = objectType({
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

export default [Party, PartyIDType];
