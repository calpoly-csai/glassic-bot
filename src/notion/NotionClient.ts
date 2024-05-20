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