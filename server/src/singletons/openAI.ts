import { OpenAI } from "openai";
require('dotenv').config();

//Singleton Pattern for open AI initialization;

class OpenAISingleton {

    static instance: OpenAISingleton | null = null;
    private openai!: OpenAI;

    constructor() {
        if(!OpenAISingleton.instance) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            })
            OpenAISingleton.instance = this;
        }
        return OpenAISingleton.instance;
    }

    getClient(): OpenAI {
        return this.openai;
    }
}

export default new OpenAISingleton().getClient();
