/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { config as loadDotEnv } from 'dotenv';
import * as env from 'env-var';

loadDotEnv();

export default {
  port: env.get('PORT').default('3000').asPortNumber(),
  // url: env.get('URL').required().asString(),
  centralLedgerDbUrl: env.get('CENTRAL_LEDGER_DB_URL').required().asUrlString(),
  eventStoreDb: env.get('EVENT_STORE_DB_URL').required().asUrlString(),
  oryKetoReadUrl: env.get('ORY_KETO_READ_URL').asUrlString(),
};
