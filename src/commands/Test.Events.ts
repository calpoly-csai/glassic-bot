import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import CustomClient from "../base/classes/CustomClient";
import SubCommand from "../base/classes/SubCommand";
import { notionClient } from "..";
import { isFullPage, isFullPageOrDatabase } from "@notionhq/client";

export default class TestEvents extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "test.events",
        })
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: false });
        const events = await notionClient.getNotionEvents();

        let str = "";
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
                value: `> ${this.statusToEmoji(status.status?.name)} [${topic.title[0].plain_text}](${e.url})`
            })
        })

        interaction.editReply({ embeds: [embed] })
    }

    private statusToEmoji(status: string | undefined) {
        switch (status) {
            case "Planning":
                return "🟡";
            case "Guest speaker confirmed":
                return "🟢";
            case "Presentation ready":
                return "🟢";
            case "Idea":
                return "🔴";
            default:
                return "⚪";
        }
    }
}