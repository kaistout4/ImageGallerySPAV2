
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./shared/ValidRoutes";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./ImageProvider";
import { UserProvider } from "./UserProvider";
import { CredentialsProvider } from "./CredentialsProvider";
import { registerImageRoutes } from "./routes/imageRoutes";
import { registerAuthRoutes } from "./routes/authRoutes";
import { verifyAuthToken } from "./middleware/authMiddleware";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();

app.locals.JWT_SECRET = JWT_SECRET;

app.use(express.json());  // for parsing application/json
app.use(express.static(STATIC_DIR));

const mongoClient = connectMongo();
let imageProvider: ImageProvider;
let userProvider: UserProvider;
let credentialsProvider: CredentialsProvider;

mongoClient.connect().then(async () => {
    const collections = await mongoClient.db().listCollections().toArray();
    imageProvider = new ImageProvider(mongoClient);
    userProvider = new UserProvider(mongoClient);
    credentialsProvider = new CredentialsProvider(mongoClient);
    
    registerAuthRoutes(app, credentialsProvider);
    
    app.use("/api/*", verifyAuthToken);
    registerImageRoutes(app, imageProvider, userProvider);
    registerAuthRoutes(app, credentialsProvider);
}).catch(error => {
    console.error("Failed to connect to MongoDB:", error);
});

app.get("/api/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

Object.values(ValidRoutes).forEach(route => {
    app.get(route, (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, "..", STATIC_DIR, "index.html"));
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});