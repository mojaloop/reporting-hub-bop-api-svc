import { PrismaClient as CentralLedgerClient } from '@app/generated/centralLedger';
import { PrismaClient as EventStoreClient } from '@app/generated/eventStore';

const createCentralLedgerClient = (logQuery = false): CentralLedgerClient =>
  new CentralLedgerClient({
    log: logQuery ? ['query'] : [],
  });

const createEventStoreClient = (logQuery = false): EventStoreClient =>
  new EventStoreClient({
    log: logQuery ? ['query'] : [],
  });

export {
  createCentralLedgerClient,
  createEventStoreClient,
  CentralLedgerClient,
  EventStoreClient,
};
