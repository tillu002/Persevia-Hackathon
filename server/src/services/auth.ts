import prisma from "../singletons/prismaClient";


export class UserSession {


    public static async createSession(studentId: string | undefined): Promise<string | null> {
        if (!studentId) {
            throw new Error("studentId is required");
        }

        try {
            const previousSession = await prisma.session.findUnique({
                where: {
                    studentId: studentId,
                },
            });

            if (previousSession) {
                const currentTime = new Date();
                if (previousSession.expire > currentTime) {
                    return previousSession.id;
                }
                await prisma.session.delete({
                    where: {
                        id: previousSession.id,
                    },
                });
            }
            const newSession = await prisma.session.create({
                data: {
                    createdAt: new Date(),
                    expire: new Date(Date.now() + 1000 * 60 * 60 * 24),
                    studentId: studentId,
                },
            });

            return newSession.id;
        } catch (error) {
            console.error("Error creating session:", error);
            throw new Error("Failed to create session");
        }
    }



    public static async getSession(studentId: string) {
    try {
        const session = await prisma.session.findUnique({
        where: {
            studentId: studentId
        },
        });
        return session?.id;
    } catch (error) {
        console.error('Error fetching session:', error);
        throw new Error('Failed to fetch session');
    }
    }

    public static async deleteSession(studentId: string) {
    try {
        const session = await prisma.session.delete({
        where: {
            studentId: studentId
        },
        });
        return session.id;
    } catch (error) {
        console.error('Error deleting session:', error);
        throw new Error('Failed to delete session');
    }}

    public static async extendSession(studentId: string) {
        try {
        const updatedSession = await prisma.session.update({
        where: {
            studentId: studentId
        },
        data: {
            expire: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
        });
        return updatedSession.id;
    } catch (error) {
        console.error('Error extending session:', error);
        throw new Error('Failed to extend session');
    }
    }

}