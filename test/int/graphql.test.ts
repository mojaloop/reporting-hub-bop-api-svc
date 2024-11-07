import { ObjectId } from 'mongodb';
import { getMongoClient, Collection, closeMongoClientConnection } from '../../src/lib/mongo';
import Transfer from '../../src/schema/Transfer';
import { objectType, extendType, queryField, makeSchema } from 'nexus';
import Query from '../../src/schema/Transfer/Query';
import { graphql } from 'graphql';
import TransferSummary from '@app/schema/TransferSummary/TransferSummary';
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


});

describe('Send sample graphql queries', () => {
    it('should send a transfer query', async () => {
        const schema = makeSchema({
            types: [Transfer, Query, objectType, extendType, queryField],
        });

        const query = `
            query {
                transaction {
                    count
                    amount
                    payerDFSP
                    payeeDFSP
                    currency
                    errorCode
                }
            }`;

        const result = await graphql({ schema, source: query });
        expect(result).toMatchSnapshot();
    });
});