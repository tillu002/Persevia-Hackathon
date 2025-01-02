import { Student, PersonalDetails } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { createHash, createSalt } from '../utils/helper';
import prisma from '../singletons/prismaClient';

interface goalProps {
studentId: string;
type: 'ACADEMIC' | 'CAREER' | 'PERSONAL';
description: string;
}

interface skillProps {
    studentId: string;
    type: 'DESIRED' | 'CURRENT' | 'PARTIAL';
    skillName: string
}

export class UserService {

    public static async createUser(firstName: string, lastName: string, email: string, password: string, phoneNumber?: string | undefined): Promise<Partial<Student> | null> {
        const existingUser = await prisma.student.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error("User already exists");
        }

        const salt = randomBytes(32).toString('hex');
        const hashedPassword = createHash(salt, password);
    try {
        const newUser = await prisma.student.create({
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
        if(newUser) {
            const { id, firstName, lastName, email, profilePicture } = newUser;
            return { id, firstName, lastName, email, profilePicture }
;        }
        return newUser;
    } catch (error) {
        //@ts-ignore
        throw new Error('Error creating user: ' + error.message);
    }
    }

    public static async signinUser(email: string, password: string): Promise<Partial<Student> | null> {
        try {
            const student = await prisma.student.findUnique({
                where: { email },
            });

            if (!student) {
                return null;
            }

            if (!student.password && student.googleId) {
                throw new Error('Please sign in with Google');
            }

            const studentSalt = student.salt;
            const studentHashedPassword = createHash(studentSalt, password);

            if(studentHashedPassword === student.password) {
                const { id, firstName, lastName, email, profilePicture } = student;
                return { id, firstName, lastName, email, profilePicture };
            }
            return null;
        } catch (error) {
            throw new Error('Error logging in user: ' + (error as Error).message);
        }
    }

    public static async setPasswordForOAuthUser(
        studentId: string,
        password: string
    ): Promise<Student> {
        const salt = createSalt();
        const hashedPassword = createHash(salt, password);

        return prisma.student.update({
            where: { id: studentId },
            data: {
                password: hashedPassword,
                salt: salt
            }
        });
    }

    public static async updateUser(studentId: string, updates: Partial<Student>): Promise<Student> {
        try {
            const updatedUser = await prisma.student.update({
            where: {
                id: studentId,
            },
            data: updates,
        });
            return updatedUser;
        } catch (error) {
          //@ts-ignore
            throw new Error('Error updating user: ' + error.message);
        }
    }

    public static async deleteStudent(email: string): Promise<string> {
        try {
        const student = await prisma.student.findUnique({
            where: { email: email },
        });

        if (!student) {
            throw new Error('User not found');
        }
        await prisma.student.delete({
            where: { email: email },
        });
            return `User with ID ${email} has been successfully deleted.`;
        } catch (error) {
            //@ts-ignore
            console.error(`Error deleting user: ${error.message}`);
            //@ts-ignore
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }

    public static async createPersonalDetails(studentId: string, collegeName: string, yearOfStudy: number, degreeProgram: string, fieldOfStudy: string, dateOfBirth: string) {
        try {

            const personalDetails = await prisma.personalDetails.create({
                data: {
                    collegeName: collegeName,
                    fieldOfStudy: fieldOfStudy,
                    studentId: studentId,
                    yearOfStudy: yearOfStudy,
                    degreeProgram: degreeProgram,
                    dateOfBirth: dateOfBirth
                }
            })
            return personalDetails;
        }catch(error) {
            //@ts-ignore
            console.error(`Error deleting user: ${error.message}`);
        }
    }

    public static async getPersonalDetails(studentId: string) {
        try {
            const userDetials = await prisma.personalDetails.findFirst({
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

            if(userDetials) {
                return userDetials;
            }
            return userDetials;

        }catch(error) {
            //@ts-ignore
            console.log("An error occured: " + error)
        }
    }


    public static async createGoals({studentId, type, description}: goalProps) {
        if(!studentId) {
            return 'student id not provided';
        }

        const goal = await prisma.goal.create({
            data: {
                studentId: studentId,
                type: type,
                description: description
            }
        })

        if(goal) {
            return goal;
        }
    }

    public static async getGoals(studentId: string) {
        try {
        const goals = await prisma.goal.findMany({
            where: {
                studentId: studentId
            }
        })
        if(goals) {
            return goals;
        } else {
            return 'No goals found for student'
        }
    } catch(err) {
        console.log('Error fetching goals for student')
    }}

    public static async createSkill({studentId, type, skillName}: skillProps) {
        try {
        const skill = await prisma.skill.create({
            data: {
                studentId: studentId,
                type: type,
                skillName: skillName
            }
        })
        if(skill) {
            return skill;
        } else {
            return 'Unable to createSkill';
        }
        }catch(err) {
            return err;
        }
    }

    public static async getSkills(studentId: string) {
        try {
            const skills = await prisma.skill.findMany({
                where: {
                    studentId: studentId
                }
            })
            if(skills) {
                return skills;
            } else {
                return 'No skills found for this user'
            }
        }catch(err) {
            return  err;
        }
    }

}