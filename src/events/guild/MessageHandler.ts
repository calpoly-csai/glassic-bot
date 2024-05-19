import { EmbedBuilder, Events, Message } from "discord.js";
import Event from "../../base/classes/Event";
import { gemini, notionClient } from "../..";
import DiscordClient from "../../base/classes/DiscordClient";
import { isFullPage } from "@notionhq/client";
import { statusToEmoji } from "../../notion/NotionClient";

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
            const result = await gemini.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (text.startsWith("MSG:")) {
                msg.reply(text.slice(4));
            } else if (text.startsWith("CMD:")) {
                console.log("doing it", text)
                const command = text.split(":")[1];
                console.log("command", command + ";")
                if (command.startsWith("events")) {
                    // send the user a list of upcoming events and their status

                    console.log("events")
                    const events = await notionClient.getNotionEvents();

                    let embed = new EmbedBuilder().setColor("Blue");

                    events.results.forEach((e) => {
                        if (!isFullPage(e)) return;

                        let topic = e.properties.Topic;
                        if (!(topic.type == "title")) return;
                        let dateString = e.properties.Date;
                        if (!(dateString.type == "date")) return;
                        const status = e.properties.Status;
                        if (!(status.type == "status")) return;

                        console.log(e);
                        console.log(dateString);
                        const date = new Date(Date.parse(dateString.date?.start || "??"));

                        let title = ((date.toLocaleDateString("en-US", {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                        }) || "Unknown"))

                        embed.addFields({
                            name: title,
                            value: `> ${statusToEmoji(status.status?.name)} [${topic.title[0].plain_text}](${e.url})`
                        })
                    })


                    msg.reply({
                        content: `Here's what's coming in the next few weeks:`
                        , embeds: [embed]
                    });
                }
            }
        }
    }
}