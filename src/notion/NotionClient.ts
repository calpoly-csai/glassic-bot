import { Client } from "@notionhq/client";
import { CONFIG } from "..";

export default class NotionClient extends Client {
    constructor() {
        super({
            auth: process.env.NOTION_TOKEN,
        });
    }

    getNotionEvents = async () => {
        const info = await this.databases.query({
            database_id: CONFIG.notion.database_id,
            filter: {
                property: "Date",
                date: {
                    next_month: {}
                }
            },
            sorts: [
                {
                    property: "Date",
                    direction: "ascending"
                }
            ]
        })

        return info;
    }
}

export const statusToEmoji = (status: string | undefined) => {
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
