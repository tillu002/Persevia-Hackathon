import { PrismaClient } from "@prisma/client";
require('dotenv').config;

let prisma: PrismaClient;

if(process.env.NODE_ENV === 'PRODUCTION') {
    prisma = new PrismaClient();
} else {
    if(!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}

export default prisma;