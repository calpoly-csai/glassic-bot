import { EmbedBuilder } from "discord.js";
import { NotionEvent } from "../notion/NotionClient";
import EmbedEventListBuilder from "./EmbedEventListBuilder";

const notionEventsToDiscordEmbed = async (events: NotionEvent[]) => {
    let embed = new EmbedBuilder().setColor("Blue");

    if (!events.length) {
        embed.addFields({
            name: "No events found",
            value: "No events found in the database",
        })
        return embed;
    }

    let embedBuilder = new EmbedEventListBuilder()
        .addEvents(events.map(e => ({
            date: e.startDate,
            topic: e.notion_title,
            url: e.url,
            eventBody: [
                `${statusMsg(e.status)}`,
                `${eplanMsg(e.eplan)}`,
            ]
        })))

    embed.addFields(embedBuilder.build());

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