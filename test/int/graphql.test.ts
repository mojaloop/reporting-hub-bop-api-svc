// TransferSummary.test.ts
import { ObjectId } from 'mongodb';
import { getMongoClient, Collection, closeMongoClientConnection } from '../../src/lib/mongo';
import TransferSummary from '../../src/schema/TransferSummary';
import { objectType, extendType, queryField } from 'nexus';
const testTransfers = require('./data/reporting.transfers.json');

describe('TransferSummary Integration Tests', () => {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
    let collection: Collection;

    beforeAll(async () => {
        try {
            collection = await getMongoClient(MONGO_URI);
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
            expect(insertedIdsCount).toEqual(8);
        });
    });

    describe('Send sample graphql queries', () => {
        it('should fetch a transfer using 4 fields', async () => {
            console.log("I am not seeing handlers and their respective graphql methods.");
            
        });
    });
});