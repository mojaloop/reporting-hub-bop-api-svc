// graphql.test.ts
import { ObjectId } from 'mongodb';
import { getMongoClient, Collection, closeMongoClientConnection } from '../../src/lib/mongo';
import { objectType, extendType, queryField } from 'nexus';
const testTransfers = require('./data/reporting.transfers.json');

describe('GraphQL Integration Tests', () => {
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

    describe('Send sample graphql queries', () => {
        it('should fetch a transfer using 4 fields', async () => {
            console.log("I am not seeing handlers and their respective graphql methods.");
            
        });
    });
});