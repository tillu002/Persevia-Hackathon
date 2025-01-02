import { Student } from "@prisma/client";


declare global {
    var prisma: PrismaClient | undefined;
    namespace Express {
      interface Request {
          user?: Student & { id: string; tokens?: { accessToken: string; refreshToken: string } };
      }
  }
}

export {};