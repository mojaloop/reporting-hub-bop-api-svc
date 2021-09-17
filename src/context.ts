import {
  createCentralLedgerClient,
  createEventStoreClient,
  createLogger,
  LogLevel,
} from './lib';
import config from './config';

const centralLedger = createCentralLedgerClient(true);
const eventStore = createEventStoreClient(true);
const log = createLogger(LogLevel.DEBUG);

export interface Context {
  log: typeof log;
  centralLedger: typeof centralLedger;
  eventStore: typeof eventStore;
  config: typeof config;
  loaders: WeakMap<any, any>;
}

export const createContext = (ctx: any): Context => ({
  ...ctx,
  config,
  log,
  centralLedger,
  eventStore,
  loaders: new WeakMap(),
});
