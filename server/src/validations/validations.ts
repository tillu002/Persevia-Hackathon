import { z } from 'zod';

export const goalPropsSchema = z.object({
    type: z.enum(['ACADEMIC', 'CAREER', 'PERSONAL'], { message: "Invalid goal type" }),
    description: z.string().min(1, { message: "Description is required" }),
});

export const skillPropsSchema = z.object({
    type: z.enum(['DESIRED', 'CURRENT', 'PARTIAL'], { message: "Invalid type provided" }),
    skillName: z.string().min(1, { message: "Skill name is required" }),
});
