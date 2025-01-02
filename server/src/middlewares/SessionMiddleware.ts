import { Request, Response, NextFunction } from "express";
import prisma from "../singletons/prismaClient";

export const SessionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    console.log("SessionMiddleware triggered");

    if (req.isAuthenticated()) {
        const userId = req.user?.id;
        console.log("Authenticated User ID:", userId);

        try {
            const session = await prisma.session.findFirst({
                where: { studentId: userId },
            });

            if (!session) {
                console.log("No session found for user");
                return res.status(401).json({
                    error: "Session expired",
                    message: "Your session has expired. Please log in again.",
                });
            }

            if (new Date(session.expire) < new Date()) {
                console.log("Session expired:", session.expire);
                return res.status(401).json({
                    error: "Session expired",
                    message: "Your session has expired. Please log in again.",
                });
            }

            console.log("Session is valid");
            return next();
        } catch (error) {
            console.error("Error checking session:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } else {
        console.log("User not authenticated");
        return res.status(401).json({
            error: "Unauthorized",
            message: "You need to log in to access this resource.",
        });
    }
};
