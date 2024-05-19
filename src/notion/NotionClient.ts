import { Client } from "@notionhq/client";

export default class NotionClient extends Client {
    constructor() {
        super({
            auth: process.env.NOTION_TOKEN,
        });
    }

    getNotionEvents = async () => {
        const info = await this.databases.query({
            database_id: "c8be488ab08d4a0d839719cb0143c1ee",
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
