"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionMiddleware = void 0;
const prismaClient_1 = __importDefault(require("../singletons/prismaClient"));
const SessionMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("SessionMiddleware triggered");
    if (req.isAuthenticated()) {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        console.log("Authenticated User ID:", userId);
        try {
            const session = yield prismaClient_1.default.session.findFirst({
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
        }
        catch (error) {
            console.error("Error checking session:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
    else {
        console.log("User not authenticated");
        return res.status(401).json({
            error: "Unauthorized",
            message: "You need to log in to access this resource.",
        });
    }
});
exports.SessionMiddleware = SessionMiddleware;
