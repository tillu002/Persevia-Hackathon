"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentDayOfWeekInIST = exports.verifyPassword = exports.createSalt = exports.createHash = exports.getCurrentDateInIST = void 0;
exports.getISTTime = getISTTime;
const node_crypto_1 = require("node:crypto");
const date_fns_1 = require("date-fns");
const getCurrentDateInIST = () => {
    const now = new Date();
    const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    return (0, date_fns_1.format)(istTime, 'yyyy-MM-dd');
};
exports.getCurrentDateInIST = getCurrentDateInIST;
const createHash = (salt, password) => {
    return (0, node_crypto_1.createHmac)("sha256", salt).update(password).digest("hex");
};
exports.createHash = createHash;
const createSalt = () => {
    return (0, node_crypto_1.randomBytes)(32).toString("hex");
};
exports.createSalt = createSalt;
const verifyPassword = (inputPassword, salt, storedHash) => {
    const inputHash = (0, exports.createHash)(salt, inputPassword);
    return inputHash === storedHash;
};
exports.verifyPassword = verifyPassword;
function getISTTime() {
    const options = {
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
const getCurrentDayOfWeekInIST = () => {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const now = new Date();
    const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    return daysOfWeek[istTime.getUTCDay()];
};
exports.getCurrentDayOfWeekInIST = getCurrentDayOfWeekInIST;
