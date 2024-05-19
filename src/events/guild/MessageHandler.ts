import { Events, Message } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import { gemini } from "../..";

export default class MessageHandler extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: Events.MessageCreate,
            description: "Message handler event.",
            once: false,
        })
        console.log("created message handler.")
    }

    async Execute(msg: Message) {
        if (msg.content.startsWith("!g")) {
            const prompt = msg.content.slice(3);
            const result = await gemini.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            msg.reply(text);
        }
    }
}