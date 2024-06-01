import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import LLM from "./LLM";

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
                - option 1: "${ResType.MSG}:[response]" : respond to a prompt with a message, as usual. 
                - option 2: "${ResType.CMD}:[command]" : call a command. commands available to you will be specified in the prompt.\
                    if no commands are specified, assume you can't execute any commands.

                please choose to respond in the format of option 1 or option 2, whichever is appropriate.\
                any formatting or additional requests given in each prompt should all fit within the [response] section, and \
                you should retain this formatting always.

                Remember, you haven't been set up to do anything conversational, \
                so you can just respond to one prompt at a time. You'll have no context from previou prompts.\
                do not prompt the user to execute discord commands.`,
        }, { apiVersion: "v1beta" });
    }

    async prompt(prompt: string, cmds?: Map<string, () => string>) {
        if (cmds) {
            prompt += "\n\nCommands available to you are: ";
            for (let [cmd] of cmds.entries()) {
                prompt += `\n- ${cmd}`;
            }
        }

        let res = (await this.gemini.generateContent(prompt).then()).response.text();
        const [resType, ...msg_etc] = res.split(":");
        let msg = msg_etc.join(":");
        if (resType === ResType.CMD) {
            if (!cmds) return "You prompted me to execute a command, I don't have any commands to execute for this message.";

            let cmd = res[1];
            if (cmds.has(cmd)) {
                return cmds.get(cmd)!();
            } else {
                return "Your prompt made me think of a command, but I don't know what that command is.";
            }
        } else {
            return msg;
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
    MSG = "MSG",
}