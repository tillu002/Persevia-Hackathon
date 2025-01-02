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
exports.UserSession = void 0;
const prismaClient_1 = __importDefault(require("../singletons/prismaClient"));
class UserSession {
    static createSession(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!studentId) {
                throw new Error("studentId is required");
            }
            try {
                const previousSession = yield prismaClient_1.default.session.findUnique({
                    where: {
                        studentId: studentId,
                    },
                });
                if (previousSession) {
                    const currentTime = new Date();
                    if (previousSession.expire > currentTime) {
                        return previousSession.id;
                    }
                    yield prismaClient_1.default.session.delete({
                        where: {
                            id: previousSession.id,
                        },
                    });
                }
                const newSession = yield prismaClient_1.default.session.create({
                    data: {
                        createdAt: new Date(),
                        expire: new Date(Date.now() + 1000 * 60 * 60 * 24),
                        studentId: studentId,
                    },
                });
                return newSession.id;
            }
            catch (error) {
                console.error("Error creating session:", error);
                throw new Error("Failed to create session");
            }
        });
    }
    static getSession(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = yield prismaClient_1.default.session.findUnique({
                    where: {
                        studentId: studentId
                    },
                });
                return session === null || session === void 0 ? void 0 : session.id;
            }
            catch (error) {
                console.error('Error fetching session:', error);
                throw new Error('Failed to fetch session');
            }
        });
    }
    static deleteSession(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = yield prismaClient_1.default.session.delete({
                    where: {
                        studentId: studentId
                    },
                });
                return session.id;
            }
            catch (error) {
                console.error('Error deleting session:', error);
                throw new Error('Failed to delete session');
            }
        });
    }
    static extendSession(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedSession = yield prismaClient_1.default.session.update({
                    where: {
                        studentId: studentId
                    },
                    data: {
                        expire: new Date(Date.now() + 1000 * 60 * 60 * 24),
                    },
                });
                return updatedSession.id;
            }
            catch (error) {
                console.error('Error extending session:', error);
                throw new Error('Failed to extend session');
            }
        });
    }
}
exports.UserSession = UserSession;
