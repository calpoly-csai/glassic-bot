import { InteractionReplyOptions, MessagePayload } from "discord.js";


export default interface LLM {

    prompt(p: string, cmds?: Map<string, () => Promise<string | void>>): Promise<string | void>;
    paraphrase(p: string, n?: number): Promise<string>;
}