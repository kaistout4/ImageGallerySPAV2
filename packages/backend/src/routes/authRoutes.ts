import express, { Request, Response } from "express";
import { CredentialsProvider } from "../CredentialsProvider";
import jwt from "jsonwebtoken";

interface IAuthTokenPayload {
    username: string;
}

function generateAuthToken(username: string, jwtSecret: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const payload: IAuthTokenPayload = {
            username
        };
        jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token as string);
            }
        );
    });
}

export function registerAuthRoutes(app: express.Application, credentialsProvider: CredentialsProvider) {
    app.post("/auth/register", async (req: Request, res: Response) => {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).send({
                error: "Bad request",
                message: "Missing username or password"
            });
            return;
        }

        try {
            const success = await credentialsProvider.registerUser(username, password);
            
            if (success) {
                res.status(201).send();
            } else {
                res.status(409).send({
                    error: "Conflict",
                    message: "Username already taken"
                });
            }
        } catch (error) {
            console.error("Error registering user:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    app.post("/auth/login", async (req: Request, res: Response) => {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).send({
                error: "Bad request",
                message: "Missing username or password"
            });
            return;
        }

        try {
            const isValidPassword = await credentialsProvider.verifyPassword(username, password);
            
            if (isValidPassword) {
                const jwtSecret = req.app.locals.JWT_SECRET;
                
                const token = await generateAuthToken(username, jwtSecret);
                
                res.json({ token });
            } else {
                res.status(401).send({
                    error: "Unauthorized",
                    message: "Incorrect username or password"
                });
            }
        } catch (error) {
            console.error("Error logging in user:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
}