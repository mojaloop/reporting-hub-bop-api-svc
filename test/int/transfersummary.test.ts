// TransferSummary.test.ts
import { ObjectId } from 'mongodb';
import { getMongoClient, Collection, closeMongoClientConnection } from '../../src/lib/mongo';
import TransferSummary from '../../src/schema//TransferSummary';
import { objectType, extendType, queryField } from 'nexus';

describe('TransferSummary Integration Tests', () => {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
    let collection: Collection;

    // Sample test data
    const testTransfers = [
        {
            _id: new ObjectId(),
            count: 1,
            amount: 1000,
            errorCode: 0,
            payerDFSP: 'testPayerDFSP',
            payeeDFSP: 'testPayerDFSP',
            targetCurrency: 'ZMW',
            sourceCurrency: 'ZKM'
        },
        {
            _id: new ObjectId(),
            count: 2,
            amount: 1000,
            errorCode: 0,
            payerDFSP: 'testPayerDFSP',
            payeeDFSP: 'testPayerDFSP',
            targetCurrency: 'ZMW',
            sourceCurrency: 'ZKM'
        },
        {
            _id: new ObjectId(),
            count: 3,
            amount: 1000,
            errorCode: 0,
            payerDFSP: 'testPayerDFSP',
            payeeDFSP: 'testPayerDFSP',
            targetCurrency: 'ZMW',
            sourceCurrency: 'ZKM'
        }
    ];

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
            expect(insertedIdsCount).toEqual(3);
        });
    });
});