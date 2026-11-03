import { graphql } from 'graphql';
import { getMongoClient, Collection, closeMongoClientConnection } from '@app/lib';

const testTransfers = require('./data/reporting.transfers.json');
import schema from '../../src/schema';

describe('TransferSummary Integration Tests', () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
  let collection: Collection;

  beforeAll(async () => {
    try {
      collection = await getMongoClient(MONGO_URI, 'transfer');
      await collection.deleteMany({});

      console.log('Test database setup completed');
    } catch (error) {
      console.error('Database setup failed:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      if (collection) {
        await collection.deleteMany({});
        await closeMongoClientConnection();
      }
      console.log('Test database cleanup completed');
    } catch (error) {
      console.error('Database cleanup failed:', error);
      throw error;
    }
  });

  describe('insert data into live MongoDB', () => {
    it('should insert transfer summary data', async () => {
      // Insert test data
      const result = await collection.insertMany(testTransfers);

      const insertedIds = result.insertedIds;

      // get inserted ids count
      const insertedIdsCount = Object.keys(insertedIds).length;

      // Assert
      expect(insertedIdsCount).toEqual(1);
      // Only 1 row in sample mock data so expects 1 at the moment
    });
  });
});

describe('transferSummary against live MongoDB', () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
  const transfers = [
    { transferId: 't1', payerDFSP: 'dfspA', sourceAmount: 10, targetAmount: 9, createdAt: new Date('2024-01-01') },
    { transferId: 't2', payerDFSP: 'dfspA', sourceAmount: 20, targetAmount: 18, createdAt: new Date('2024-01-02') },
    { transferId: 't3', payerDFSP: 'dfspB', sourceAmount: 5, targetAmount: 4, createdAt: new Date('2024-01-03') },
  ];
  let collection: Collection;

  const summary = async (args: string) => {
    const result = await graphql({
      schema,
      source: `{ transferSummary${args} { count group { payerDFSP } sum { sourceAmount targetAmount } } }`,
      contextValue: { transaction: collection, loaders: new Map() },
    });
    expect(result.errors).toBeUndefined();
    return (result.data as any).transferSummary;
  };

  beforeAll(async () => {
    collection = await getMongoClient(MONGO_URI, 'transfer');
    await collection.deleteMany({});
    await collection.insertMany(transfers);
  });

  afterAll(async () => {
    await collection.deleteMany({});
    await closeMongoClientConnection();
  });

  it('sums every transfer when nothing is filtered or grouped', async () => {
    expect(await summary('')).toEqual([
      { count: 3, group: { payerDFSP: null }, sum: { sourceAmount: 35, targetAmount: 31 } },
    ]);
  });

  it('sums only the transfers inside the time window', async () => {
    expect(await summary('(filter: { startDate: "2024-01-02", endDate: "2024-01-03" })')).toEqual([
      { count: 2, group: { payerDFSP: null }, sum: { sourceAmount: 25, targetAmount: 22 } },
    ]);
  });

  it('answers a zero summary when no transfer matches', async () => {
    expect(await summary('(filter: { startDate: "2025-01-01" })')).toEqual([
      { count: 0, group: { payerDFSP: null }, sum: { sourceAmount: 0, targetAmount: 0 } },
    ]);
  });

  it('groups by payer, largest group first', async () => {
    expect(await summary('(groupBy: ["payerDFSP"])')).toEqual([
      { count: 2, group: { payerDFSP: 'dfspA' }, sum: { sourceAmount: 30, targetAmount: 27 } },
      { count: 1, group: { payerDFSP: 'dfspB' }, sum: { sourceAmount: 5, targetAmount: 4 } },
    ]);
  });
});

describe('Send sample graphql queries', () => {
  let mockCtx;
  beforeEach(() => {
    const mockTransfer = {
      transferId: 'b51ec534-ee48-4575-b6a9-ead2955b8069',
      transactionId: 'transaction123',
      sourceAmount: 100,
      sourceCurrency: 'USD',
      targetAmount: 90,
      targetCurrency: 'EUR',
      createdAt: '2024-11-14T06:24:56.719Z',
      lastUpdated: '2024-11-14T06:24:56.720Z',
      transferState: 'COMPLETED',
      transactionType: 'TRANSFER',
    };

    mockCtx = {
      transaction: {
        findOne: jest.fn().mockResolvedValue(mockTransfer),
      },
    };
  });

  it('should send a transfer query', async () => {
    const query = `
      query {
        transfer(transferId: "b51ec534-ee48-4575-b6a9-ead2955b8069") {
          transferId
          transactionId
          sourceAmount
          sourceCurrency
          targetAmount
          targetCurrency
          createdAt
          lastUpdated
          transferState
          transactionType
        }
      }
    `;
    const result = await graphql({
      schema,
      source: query,
      contextValue: mockCtx,
    });

    expect(result).toMatchSnapshot();
    expect(mockCtx.transaction.findOne).toHaveBeenCalledWith({
      transferId: 'b51ec534-ee48-4575-b6a9-ead2955b8069',
    });
  });
});
