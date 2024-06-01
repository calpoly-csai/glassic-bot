import { Events, Message } from "discord.js";
import Event from "../../base/classes/Event";
import DiscordClient from "../../base/classes/DiscordClient";
import notionEventsToDiscordEmbed from "../../utils/notionEventsToDiscordEmbed";

export default class MessageHandler extends Event {
    constructor(client: DiscordClient) {
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
            const text = await this.client.llm.prompt(prompt);

            if (text.startsWith("MSG:")) {
                msg.reply(text.slice(4));
            } else if (text.startsWith("CMD:")) {
                console.log("doing it", text)
                const command = text.split(":")[1];
                console.log("command", command + ";")
                if (command.startsWith("events")) {
                    // send the user a list of upcoming events and their status

                    console.log("events")
                    const events = await this.client.notionClient.getNotionMemberEvents();
                    const embed = await notionEventsToDiscordEmbed(events);

                    msg.reply({
                        content: `Here's what's coming in the next few weeks:`
                        , embeds: [embed]
                    });
                }
            }
        }
    }
}