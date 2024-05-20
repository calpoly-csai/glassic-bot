import { isFullPage } from "@notionhq/client";
import { PageObjectResponse, QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import { EmbedBuilder } from "discord.js";

const notionEventsToDiscordEmbed = async (events: QueryDatabaseResponse) => {
    let embed = new EmbedBuilder().setColor("Blue");

    events.results.forEach((e) => {
        if (!isFullPage(e)) return;

        let body = "";

        let topic = e.properties.Topic;
        if ((topic.type == "title")) {
            body += `> [${topic.title[0].plain_text}](${e.url})\n`
        } else {
            body += `> [?? Unknown topic](${e.url})\n`
        }

        body += `> ${statusMsg(e)}\n`
        body += `> ${eplanMsg(e)}\n`

        let dateString = e.properties.Date;
        if (!(dateString.type == "date")) return;
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
            value: body,
        })
    })

    return embed;
}

const eplanMsg = (page: PageObjectResponse) => {
    switch (!(page.properties["e-plan"].type == "select") || page.properties["e-plan"].select?.name) {
        case "Confirmed":
            return "✅ E-plan: confirmed";
        case "Todo":
            return "❌ E-plan: todo";
        default:
            return "❌ E-plan: no status";
    }
}

const statusMsg = (status: PageObjectResponse) => {
    switch (!(status.properties.Status.type == "status") || status.properties.Status.status?.name) {
        case "Guest speaker confirmed":
            return "✅ Status: guest speaker confirmed";
        case "Presentation ready":
            return "✅ Status: presentation ready";
        case "Planning":
            return "❌ Status: planning";
        case "Idea":
            return "❌ Status: brainstorming";
        default:
            return "⁉️ Status: unknown";
    }
}


export default notionEventsToDiscordEmbed;