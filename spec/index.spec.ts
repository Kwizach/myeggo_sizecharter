import { MongoClient, Db } from 'mongodb';

import { MONGO_URL } from '../src/lib/global';

describe("Mongo connection", () => {
    var client: MongoClient;
    var db:     Db;

    beforeAll( () => {
        client = new MongoClient( MONGO_URL, { useNewUrlParser: true } );
    });

    it("Should connect to server", () => {
        client.connect(
            (err) => {
                expect(err).toBeNull();
                client.close();
            }
        );
    });

    it("Should connect to db", () => {
        client.connect(
            () => {
                db = client.db("sizecharter");
                expect(db).toBeDefined();
                client.close();
            }
        );
    });
});