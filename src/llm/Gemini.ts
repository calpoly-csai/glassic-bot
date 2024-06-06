import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import LLM from "./LLM";
import { InteractionReplyOptions, MessagePayload } from "discord.js";

export default class Gemini implements LLM {
    gemini: GenerativeModel;

    constructor() {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
        this.gemini = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
            systemInstruction: `You are a Discord bot named Glassic, \
                tasked with helping the Computer Science and Artificial Intelligence Club (CS+AI) \
                manage their Discord server, Google Calendar, and Notion workspace. 

                You can respond to prompts in two ways, in these formats: 
                - option 1: just send plain text: respond to a prompt with a message, as usual. 
                - option 2: format as ${ResType.CMD}:[command and arguments]: call a command. commands available to you will be specified in the prompt.\
                    if no commands are specified, assume you can't execute any commands.

                please respond in the one of the formats above, whichever is appropriate.

                Remember, you haven't been set up to do anything conversational, \
                so you can just respond to one prompt at a time. You'll have no context from previous prompts.\
                do not prompt the user to execute discord commands.`,
        }, { apiVersion: "v1beta" });
    }

    async prompt(prompt: string, cmds?: Map<string, () => Promise<string | void>>) {
        if (cmds) {
            prompt += "\n\nCommands available to you are: ";
            for (let [cmd] of cmds.entries()) {
                if (cmd.indexOf(" ") !== -1) throw new Error("Gemini command names cannot contain spaces.");

                prompt += `\n- ${cmd}`;
            }
            prompt += "\n\nPlease respond with CMD:[command and arguments] to call a command.\
            Omit the prefix and just type a message to respond with a message."
        }

        let res = (await this.gemini.generateContent(prompt)
            .catch((err) => console.log("[Gemini - ERROR]", JSON.stringify(err, null, 2))))
        if (!res) return;

        let content = res.response.text().trim();
        console.log("[Gemini]", content);

        if (content.startsWith(ResType.CMD)) {
            if (!cmds) return "You prompted me to execute a command, I don't have any commands to execute for this message.";

            let cmd = content.slice(ResType.CMD.length + ":".length).trim().split(" ")[0];
            if (cmds.has(cmd)) {
                return cmds.get(cmd)!();
            } else {
                return "Your prompt made me think of a command, but I don't know what that command is.";
            }
        } else {
            return content;
        }
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

enum ResType {
    CMD = "CMD",
}