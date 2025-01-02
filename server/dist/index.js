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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const passport_1 = __importDefault(require("passport"));
require("./configs/passport"); // Ensure passport configuration is loaded before server starts
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const express_session_1 = __importDefault(require("express-session"));
const gptRoutes_1 = __importDefault(require("./routes/gptRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const SessionMiddleware_1 = require("./middlewares/SessionMiddleware");
require('dotenv').config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24,
    },
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use("/auth", authRoutes_1.default);
app.use('/user', userRoutes_1.default);
app.use("/gpt", gptRoutes_1.default);
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
//@ts-ignore
app.get("/dashboard", SessionMiddleware_1.SessionMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.json({ msg: "Dashboard Page" });
}));
//@ts-ignore
app.get("/auth/login-failed", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.json({ message: "Failed to login" });
}));
app.listen(port, () => {
    console.log(`Server is up and running on port ${port}`);
});
