import { isFullPage } from "@notionhq/client";
import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import { EmbedBuilder } from "discord.js";
import { statusToEmoji } from "../notion/NotionClient";

const notionEventsToDiscordEmbed = async (events: QueryDatabaseResponse) => {
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

    return embed;
}
export default notionEventsToDiscordEmbed;