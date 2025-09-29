import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import LLM from "./LLM";
import Logger from "../utils/Logger";

export default class Gemini implements LLM {
    gemini: GenerativeModel;

    constructor() {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
        this.gemini = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            systemInstruction: `When prompted, please respond to the prompt with no additional 
                                information, formatting, or fluff, other than what is requested in that specific prompt.`,
        }, { apiVersion: "v1beta" });
    }

    async prompt(prompt: string) {
        let res = (await this.gemini.generateContent(prompt)
            .catch((err) => Logger.once("Gemini", "ERROR: Failed to generate response\n" + JSON.stringify(err, null, 2))))
        if (!res) return;

        let content = res.response.text().trim();
        Logger.once("Gemini", "SUCCESS: Generated the following response" + content);

        return content
    }

    async paraphrase(prompt: string, numSentences?: number) {
        let result;
        if (numSentences) {
            result = await this.gemini.generateContent(`Paraphrase the following text in approximately ${numSentences} sentences: ${prompt}`);
        } else {
            result = await this.gemini.generateContent(`Paraphrase the following text ${prompt}`);
        }
        return result.response.text();
    }

}