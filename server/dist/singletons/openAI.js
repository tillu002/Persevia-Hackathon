"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("openai");
require('dotenv').config();
//Singleton Pattern for open AI initialization;
class OpenAISingleton {
    constructor() {
        if (!OpenAISingleton.instance) {
            this.openai = new openai_1.OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
            OpenAISingleton.instance = this;
        }
        return OpenAISingleton.instance;
    }
    getClient() {
        return this.openai;
    }
}
OpenAISingleton.instance = null;
exports.default = new OpenAISingleton().getClient();
