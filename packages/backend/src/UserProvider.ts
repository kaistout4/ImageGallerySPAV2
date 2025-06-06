import { MongoClient, Collection } from "mongodb";

interface IUserDocument {
    id: string;
    username: string;
}

export class UserProvider {
    private collection: Collection<IUserDocument>

    constructor(private readonly mongoClient: MongoClient) {
        const collectionName = process.env.USERS_COLLECTION_NAME;
        if (!collectionName) {
            throw new Error("Missing USERS_COLLECTION_NAME from environment variables");
        }
        this.collection = this.mongoClient.db().collection(collectionName);
    }

    async getUsersByIds(userIds: string[]): Promise<IUserDocument[]> {
        if (userIds.length === 0) {
            return [];
        }
        return this.collection.find({ id: { $in: userIds } }).toArray();
    }
}