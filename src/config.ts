import { config as loadDotEnv } from 'dotenv';
import * as env from 'env-var';

loadDotEnv();

export default {
  port: env.get('PORT').default('3000').asPortNumber(),
  // url: env.get('URL').required().asString(),
  centralLedgerDbUrl: env.get('CENTRAL_LEDGER_DB_URL').required().asUrlString(),
  eventStoreDb: env.get('EVENT_STORE_DB_URL').required().asUrlString(),
};
