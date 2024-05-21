import { Client, isFullDatabase, isFullPage } from "@notionhq/client";
import { CONFIG } from "..";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

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

        return info.results.reduce(
            (accumulator, current) => {
                if (isFullPage(current)) {
                    accumulator.push({
                        id: current.id,
                        startDate: (current.properties.Date.type == "date" && current.properties.Date.date?.start) || "",
                        endDate: (current.properties.Date.type == "date" && current.properties.Date.date?.end) || "",
                        topic: (current.properties.Topic.type == "title" && current.properties.Topic.title[0].plain_text) || "",
                        eplan: (current.properties["e-plan"].type == "select" && current.properties["e-plan"].select?.name) || "",
                        status: (current.properties.Status.type == "status" && current.properties.Status.status?.name) || "",
                        url: current.url,
                    })
                }
                return accumulator;
            }, [] as NotionEvent[]);
    }
}

export interface NotionEvent {
    id: string,
    startDate: string,
    endDate: string,
    topic: string,
    eplan: string,
    status: string,
    url: string,
}