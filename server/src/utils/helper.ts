import { createHmac, randomBytes } from "node:crypto";
import { format } from 'date-fns';

export const getCurrentDateInIST = (): string => {
    const now = new Date();
    const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
        return format(istTime, 'yyyy-MM-dd');
};



export const createHash = (salt: string, password: string): string => {
    return createHmac("sha256", salt).update(password).digest("hex");
};

export const createSalt = (): string => {
    return randomBytes(32).toString("hex");
};

export const verifyPassword = (inputPassword: string, salt: string, storedHash: string): boolean => {
    const inputHash = createHash(salt, inputPassword);
    return inputHash === storedHash;
};

export function getISTTime(): string {
    const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const date = new Date();
    return date.toLocaleString('en-IN', options);
}

export const getCurrentDayOfWeekInIST = (): string => {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const now = new Date();
      const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    return daysOfWeek[istTime.getUTCDay()];
};
