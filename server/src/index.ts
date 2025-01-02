import express from "express";
import cors from "cors";
import path from "path";
import passport from "passport";
import './configs/passport';  // Ensure passport configuration is loaded before server starts
import userRouter from "./routes/userRoutes";
import session from "express-session";
import gptRouter from "./routes/gptRoutes";
import authRouter from "./routes/authRoutes";
import { SessionMiddleware } from "./middlewares/SessionMiddleware";
require('dotenv').config();



const app = express();
const port = process.env.PORT || 5000;

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
); app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.use(
    session({
        secret: process.env.SESSION_SECRET || "your-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24,
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);
app.use('/user', userRouter);
app.use("/gpt", gptRouter);




app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


//@ts-ignore
app.get("/dashboard", SessionMiddleware, async (req, res) => {
    return res.json({ msg: "Dashboard Page" })
});

//@ts-ignore
app.get("/auth/login-failed", async (req, res) => {
    return res.json({ message: "Failed to login" })
})

app.listen(port, () => {
    console.log(`Server is up and running on port ${port}`)
});