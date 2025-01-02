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
exports.ensureGoogleDriveAccess = void 0;
const passport_1 = __importDefault(require("passport"));
const prismaClient_1 = __importDefault(require("../singletons/prismaClient"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_local_1 = require("passport-local");
const helper_1 = require("../utils/helper");
const auth_1 = require("../services/auth");
const library_1 = require("@prisma/client/runtime/library");
require('dotenv').config();
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const tokens = { accessToken, refreshToken };
        const existingUser = yield prismaClient_1.default.student.findFirst({
            where: { googleId: profile.id },
        });
        if (existingUser) {
            const session = yield auth_1.UserSession.createSession(existingUser.id);
            return done(null, Object.assign(Object.assign({}, existingUser), { session, tokens }));
        }
        const email = (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value;
        if (!email) {
            return done(new Error('Email not found in Google profile'));
        }
        const userWithEmail = yield prismaClient_1.default.student.findFirst({
            where: { email: email },
        });
        if (userWithEmail) {
            const updatedUser = yield prismaClient_1.default.student.update({
                where: { email },
                data: { googleId: profile.id, verified: true },
            });
            const session = yield auth_1.UserSession.createSession(updatedUser.id);
            return done(null, Object.assign(Object.assign({}, updatedUser), { session, tokens }));
        }
        const newUser = yield prismaClient_1.default.student.create({
            data: {
                googleId: profile.id,
                email,
                firstName: ((_c = profile.name) === null || _c === void 0 ? void 0 : _c.givenName) || '',
                lastName: ((_d = profile.name) === null || _d === void 0 ? void 0 : _d.familyName) || '',
                profilePicture: (_f = (_e = profile.photos) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.value,
                verified: true,
                salt: '',
                password: '',
            },
        });
        const newSession = yield auth_1.UserSession.createSession(newUser.id);
        return done(null, { id: newUser.id, user: { email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName, profilePicture: newUser.profilePicture, verified: newUser.verified }, session: newSession, tokens, needsAcademicDetails: true });
    }
    catch (error) {
        console.error('OAuth Error:', error);
        if (error instanceof library_1.PrismaClientInitializationError) {
            return done(null, false, {
                message: 'Cannot reach the database. Please try again later.',
                redirectTo: '/auth/error', // Pass the error message and redirect to the error page
            });
        }
    }
})));
passport_1.default.use(new passport_local_1.Strategy({ usernameField: "email", passwordField: "password" }, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prismaClient_1.default.student.findFirst({ where: { email } });
        if (!user) {
            return done(null, false, { message: "User doesn't exist" });
        }
        const isPasswordValid = (0, helper_1.verifyPassword)(password, user.salt, user.password);
        if (!isPasswordValid) {
            return done(null, false, { message: "Incorrect email or password" });
        }
        const newSession = yield auth_1.UserSession.createSession(user.id);
        if (newSession) {
            return done(null, { user: user, newSessionId: newSession });
        }
    }
    catch (error) {
        console.error("Local Strategy Error:", error);
        return done(error);
    }
})));
passport_1.default.serializeUser((user, done) => {
    console.log('reached here');
    if (user.tokens) {
        done(null, { id: user.id, tokens: user.tokens });
        console.log('In serialized user function: user id', user.id);
    }
    else {
        done(null, { id: user.id });
    }
});
passport_1.default.deserializeUser((serializedUser, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prismaClient_1.default.student.findFirst({
            where: { id: serializedUser.id },
        });
        if (user) {
            if (serializedUser.tokens) {
                done(null, Object.assign(Object.assign({}, user), { tokens: serializedUser.tokens }));
            }
            else {
                done(null, user);
            }
        }
        else {
            done(null, false);
        }
    }
    catch (error) {
        done(error, null);
    }
}));
const ensureGoogleDriveAccess = (req, res, next) => {
    var _a, _b;
    if (!((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.tokens) === null || _b === void 0 ? void 0 : _b.accessToken)) {
        return res.status(401).json({
            error: 'Google Drive access required',
            message: 'Please authenticate with Google to access this feature',
        });
    }
    next();
};
exports.ensureGoogleDriveAccess = ensureGoogleDriveAccess;
