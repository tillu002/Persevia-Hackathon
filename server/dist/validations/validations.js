"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skillPropsSchema = exports.goalPropsSchema = void 0;
const zod_1 = require("zod");
exports.goalPropsSchema = zod_1.z.object({
    type: zod_1.z.enum(['ACADEMIC', 'CAREER', 'PERSONAL'], { message: "Invalid goal type" }),
    description: zod_1.z.string().min(1, { message: "Description is required" }),
});
exports.skillPropsSchema = zod_1.z.object({
    type: zod_1.z.enum(['DESIRED', 'CURRENT', 'PARTIAL'], { message: "Invalid type provided" }),
    skillName: zod_1.z.string().min(1, { message: "Skill name is required" }),
});
