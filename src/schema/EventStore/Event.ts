/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { objectType } from 'nexus';

const Event = objectType({
  name: 'Event',
  definition(t) {
    t.field('event', { type: 'JSONObject' });
    t.field('metadata', { type: 'JSONObject' });
  },
});

export default [Event];
