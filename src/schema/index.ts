/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { makeSchema, mutationType, queryType } from 'nexus';
import { join, dirname } from 'path';

import Scalar from './Scalar';
import DFSP from './DFSP';
import Transaction from './Transfer';
import Party from './Party';
import TransactionSummary from './TransferSummary';

const types = [Scalar, DFSP, Transaction, Party, TransactionSummary];

const Query = queryType({
  definition(t) {
    t.field('_placeholder', {
      type: 'Boolean',
    });
  },
});

const Mutation = mutationType({
  definition(t) {
    t.field('_placeholder', {
      type: 'Boolean',
    });
  },
});

export default makeSchema({
  types: [Query, Mutation, types.flat()],
  outputs: process.env.NODE_ENV !== 'production' && {
    typegen: join(dirname(require.resolve('@app/index')), '../node_modules/@types/nexus-typegen/index.d.ts'),
    schema: join(dirname(require.resolve('@app/index')), '../node_modules/@types/nexus-typegen/schema.graphql'),
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
