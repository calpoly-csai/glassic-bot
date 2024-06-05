import { EmbedBuilder } from "discord.js";
import { NotionEvent } from "../notion/NotionClient";

const notionEventsToDiscordEmbed = async (events: NotionEvent[]) => {
    let embed = new EmbedBuilder().setColor("Blue");

    if (!events.length) {
        embed.addFields({
            name: "No events found",
            value: "No events found in the database",
        })
        return embed;
    }

    events.forEach((e) => {

        let body = "";

        let topic = e.topic;
        body += `> [${topic || "?? Unknown topic"}](${e.url})\n`

        body += `> ${statusMsg(e.status)}\n`
        body += `> ${eplanMsg(e.eplan)}\n`

        let dateString = e.startDate;
        // todo catch poorly formatted dates
        const date = new Date(Date.parse(dateString || "??"));

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

const eplanMsg = (eplan: string) => {
    switch (eplan) {
        case "Confirmed":
            return "✅ E-plan: confirmed";
        case "Todo":
            return "❌ E-plan: todo";
        default:
            return "❌ E-plan: no status";
    }
}

const statusMsg = (status: string) => {
    switch (status) {
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