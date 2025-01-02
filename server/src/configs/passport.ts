import passport from "passport";
import prisma from "../singletons/prismaClient";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from "passport-local";
import { verifyPassword } from "../utils/helper";
import { UserSession } from "../services/auth";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
require('dotenv').config();


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: '/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const tokens = { accessToken, refreshToken };

                const existingUser = await prisma.student.findFirst({
                    where: { googleId: profile.id },
                });

                if (existingUser) {
                    const session = await UserSession.createSession(existingUser.id);

                    return done(null, { ...existingUser, session, tokens });
                }

                const email = profile.emails?.[0]?.value;
                if (!email) {
                    return done(new Error('Email not found in Google profile'));
                }

                const userWithEmail = await prisma.student.findFirst({
                    where: { email: email },
                });

                if (userWithEmail) {
                    const updatedUser = await prisma.student.update({
                        where: { email },
                        data: { googleId: profile.id, verified: true },
                    });
                    const session = await UserSession.createSession(updatedUser.id);
                    return done(null, { ...updatedUser, session, tokens });
                }

                const newUser = await prisma.student.create({
                    data: {
                        googleId: profile.id,
                        email,
                        firstName: profile.name?.givenName || '',
                        lastName: profile.name?.familyName || '',
                        profilePicture: profile.photos?.[0]?.value,
                        verified: true,
                        salt: '',
                        password: '',
                    },
                });

                const newSession = await UserSession.createSession(newUser.id);
                return done(null, { id: newUser.id, user: {email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName, profilePicture: newUser.profilePicture, verified: newUser.verified}, session: newSession, tokens, needsAcademicDetails: true });
            } catch (error) {
                console.error('OAuth Error:', error);
                if (error instanceof PrismaClientInitializationError) {
                    return done(null, false, {
                        message: 'Cannot reach the database. Please try again later.',
                        redirectTo: '/auth/error', // Pass the error message and redirect to the error page
                    });
            }
        }}
    )
);



passport.use(
    new LocalStrategy(
        { usernameField: "email", passwordField: "password" },
        async (email, password, done) => {
        try {
            const user = await prisma.student.findFirst({ where: { email } });

        if (!user) {
            return done(null, false, { message: "User doesn't exist" });
        }

            const isPasswordValid = verifyPassword(password, user.salt, user.password);
            if (!isPasswordValid) {
                return done(null, false, { message: "Incorrect email or password" });
            }
            const newSession = await UserSession.createSession(user.id);
            if(newSession) {
                return done(null, { user: user, newSessionId: newSession });
            }
        } catch (error) {
            console.error("Local Strategy Error:", error);
            return done(error);
        }
    }
    ));

    passport.serializeUser((user: any, done) => {
        console.log('reached here')
        if (user.tokens) {
            done(null, { id: user.id, tokens: user.tokens });
            console.log('In serialized user function: user id', user.id);
        } else {
            done(null, { id: user.id });
        }
    });

    passport.deserializeUser(async (serializedUser: { id: string; tokens?: any }, done) => {
        try {
            const user = await prisma.student.findFirst({
                where: { id: serializedUser.id },
            });
            if (user) {
                if (serializedUser.tokens) {
                    done(null, { ...user, tokens: serializedUser.tokens });
                } else {
                    done(null, user);
                }
            } else {
                done(null, false);
            }
        } catch (error) {
            done(error, null);
        }
    });

export const ensureGoogleDriveAccess = (req: any, res: any, next: any) => {
    if (!req.user?.tokens?.accessToken) {
    return res.status(401).json({
        error: 'Google Drive access required',
        message: 'Please authenticate with Google to access this feature',
    });
    }
    next();
};
