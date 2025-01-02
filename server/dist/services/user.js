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
exports.UserService = void 0;
const node_crypto_1 = require("node:crypto");
const helper_1 = require("../utils/helper");
const prismaClient_1 = __importDefault(require("../singletons/prismaClient"));
class UserService {
    static createUser(firstName, lastName, email, password, phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield prismaClient_1.default.student.findUnique({ where: { email } });
            if (existingUser) {
                throw new Error("User already exists");
            }
            const salt = (0, node_crypto_1.randomBytes)(32).toString('hex');
            const hashedPassword = (0, helper_1.createHash)(salt, password);
            try {
                const newUser = yield prismaClient_1.default.student.create({
                    data: {
                        firstName,
                        lastName,
                        email,
                        password: hashedPassword,
                        phoneNumber,
                        profilePicture: null,
                        verified: false,
                        salt: salt
                    },
                });
                if (newUser) {
                    const { id, firstName, lastName, email, profilePicture } = newUser;
                    return { id, firstName, lastName, email, profilePicture };
                }
                return newUser;
            }
            catch (error) {
                //@ts-ignore
                throw new Error('Error creating user: ' + error.message);
            }
        });
    }
    static signinUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const student = yield prismaClient_1.default.student.findUnique({
                    where: { email },
                });
                if (!student) {
                    return null;
                }
                if (!student.password && student.googleId) {
                    throw new Error('Please sign in with Google');
                }
                const studentSalt = student.salt;
                const studentHashedPassword = (0, helper_1.createHash)(studentSalt, password);
                if (studentHashedPassword === student.password) {
                    const { id, firstName, lastName, email, profilePicture } = student;
                    return { id, firstName, lastName, email, profilePicture };
                }
                return null;
            }
            catch (error) {
                throw new Error('Error logging in user: ' + error.message);
            }
        });
    }
    static setPasswordForOAuthUser(studentId, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = (0, helper_1.createSalt)();
            const hashedPassword = (0, helper_1.createHash)(salt, password);
            return prismaClient_1.default.student.update({
                where: { id: studentId },
                data: {
                    password: hashedPassword,
                    salt: salt
                }
            });
        });
    }
    static updateUser(studentId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedUser = yield prismaClient_1.default.student.update({
                    where: {
                        id: studentId,
                    },
                    data: updates,
                });
                return updatedUser;
            }
            catch (error) {
                //@ts-ignore
                throw new Error('Error updating user: ' + error.message);
            }
        });
    }
    static deleteStudent(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const student = yield prismaClient_1.default.student.findUnique({
                    where: { email: email },
                });
                if (!student) {
                    throw new Error('User not found');
                }
                yield prismaClient_1.default.student.delete({
                    where: { email: email },
                });
                return `User with ID ${email} has been successfully deleted.`;
            }
            catch (error) {
                //@ts-ignore
                console.error(`Error deleting user: ${error.message}`);
                //@ts-ignore
                throw new Error(`Failed to delete user: ${error.message}`);
            }
        });
    }
    static createPersonalDetails(studentId, collegeName, yearOfStudy, degreeProgram, fieldOfStudy, dateOfBirth) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const personalDetails = yield prismaClient_1.default.personalDetails.create({
                    data: {
                        collegeName: collegeName,
                        fieldOfStudy: fieldOfStudy,
                        studentId: studentId,
                        yearOfStudy: yearOfStudy,
                        degreeProgram: degreeProgram,
                        dateOfBirth: dateOfBirth
                    }
                });
                return personalDetails;
            }
            catch (error) {
                //@ts-ignore
                console.error(`Error deleting user: ${error.message}`);
            }
        });
    }
    static getPersonalDetails(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userDetials = yield prismaClient_1.default.personalDetails.findFirst({
                    where: {
                        studentId: studentId
                    },
                    select: {
                        fieldOfStudy: true,
                        degreeProgram: true,
                        yearOfStudy: true,
                        dateOfBirth: true,
                        collegeName: true
                    }
                });
                if (userDetials) {
                    return userDetials;
                }
                return userDetials;
            }
            catch (error) {
                //@ts-ignore
                console.log("An error occured: " + error);
            }
        });
    }
    static createGoals(_a) {
        return __awaiter(this, arguments, void 0, function* ({ studentId, type, description }) {
            if (!studentId) {
                return 'student id not provided';
            }
            const goal = yield prismaClient_1.default.goal.create({
                data: {
                    studentId: studentId,
                    type: type,
                    description: description
                }
            });
            if (goal) {
                return goal;
            }
        });
    }
    static getGoals(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const goals = yield prismaClient_1.default.goal.findMany({
                    where: {
                        studentId: studentId
                    }
                });
                if (goals) {
                    return goals;
                }
                else {
                    return 'No goals found for student';
                }
            }
            catch (err) {
                console.log('Error fetching goals for student');
            }
        });
    }
    static createSkill(_a) {
        return __awaiter(this, arguments, void 0, function* ({ studentId, type, skillName }) {
            try {
                const skill = yield prismaClient_1.default.skill.create({
                    data: {
                        studentId: studentId,
                        type: type,
                        skillName: skillName
                    }
                });
                if (skill) {
                    return skill;
                }
                else {
                    return 'Unable to createSkill';
                }
            }
            catch (err) {
                return err;
            }
        });
    }
    static getSkills(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const skills = yield prismaClient_1.default.skill.findMany({
                    where: {
                        studentId: studentId
                    }
                });
                if (skills) {
                    return skills;
                }
                else {
                    return 'No skills found for this user';
                }
            }
            catch (err) {
                return err;
            }
        });
    }
}
exports.UserService = UserService;
