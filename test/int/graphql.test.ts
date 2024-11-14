import { makeSchema, mutationType, queryType } from 'nexus';
import { graphql } from 'graphql';
import { getMongoClient, Collection, closeMongoClientConnection } from '@app/lib';
import Transfer from '../../src/schema/Transfer';
import Query from '../../src/schema/Transfer/Query';

const testTransfers = require('./data/reporting.transfers.json');
// import schema from '../../src/schema';

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
        closeMongoClientConnection();
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

// describe('Send sample graphql queries', () => {
//   let mockCtx;
//   beforeEach(() => {
//     const mockTransfer = {
//       transferId: 'b51ec534-ee48-4575-b6a9-ead2955b8069',
//       transactionId: 'transaction123',
//       sourceAmount: 100,
//       sourceCurrency: 'USD',
//       targetAmount: 90,
//       targetCurrency: 'EUR',
//       createdAt: '2024-11-14T06:24:56.719Z',
//       lastUpdated: '2024-11-14T06:24:56.720Z',
//       transferState: 'COMPLETED',
//       transactionType: 'TRANSFER',
//     };
//
//     mockCtx = {
//       transaction: {
//         transaction: {
//           findUnique: jest.fn().mockResolvedValue(mockTransfer),
//           findMany: jest.fn().mockResolvedValue([mockTransfer]),
//         },
//       },
//     };
//   });
//
//   it('should send a transfer query', async () => {
//     const query = `
//       query {
//         transfer(transferId: "b51ec534-ee48-4575-b6a9-ead2955b8069") {
//           transferId
//           transactionId
//           sourceAmount
//           sourceCurrency
//           targetAmount
//           targetCurrency
//           createdAt
//           lastUpdated
//           transferState
//           transactionType
//         }
//       }
//     `;
//     const result = await graphql({
//       schema,
//       source: query,
//       contextValue: mockCtx,
//     });
//
//     // Assert the expected result
//     expect(result).toMatchSnapshot();
//     expect(mockCtx.transaction.transaction.findUnique).toHaveBeenCalledWith({
//       where: { transferId: 'b51ec534-ee48-4575-b6a9-ead2955b8069' },
//     });
//   });

describe('Fetch sample graphql queries', () => {
  it('should fetch all transfers query', async () => {
    const schema = makeSchema({
      types: [Transfer, Query],
    });

    const query = `
          query {
              getAllTransfers(limit: 10, offset: 0) {
                id
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
                errorCode
                transferSettlementWindowId
                payerDFSP
                payerDFSPProxy
                payeeDFSP
                payeeDFSPProxy
                positionChanges{
                  updatedPosition
                  
                }
                payerParty{
                  partyName
                }
                payeeParty{
                  partyName
                }
                quoteRequest{
                  quoteId
                }
                transferTerms{
                  geoCode{
                    latitude
                  }
                }
                conversions{
                  conversionId
                }
                
              }
            }`;

    const result = await graphql({
      schema,
      source: query,
    });

    // Assert the results
    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();
  });

  it('should fetch a transfer by query', async () => {
    const schema = makeSchema({
      types: [Transfer, Query],
    });

    const query = `
      query {
        transfers(transferId: "b51ec534-ee48-4575-b6a9-ead2955b8069") {
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
          errorCode
          transferSettlementWindowId
          payerDFSP
          payerDFSPProxy
          payeeDFSP
          payeeDFSPProxy
          positionChanges{
            updatedPosition
            
          }
          payerParty{
            partyName
          }
          payeeParty{
            partyName
          }
          quoteRequest{
            quoteId
          }
          transferTerms{
            geoCode{
              latitude
            }
          }
          conversions{
            conversionId
          }
        }
      }`;

    const result = await graphql({
      schema,
      source: query,
    });

    // Assert the results
    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();
  });
});
