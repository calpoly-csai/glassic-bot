import { Client, isFullPage } from "@notionhq/client";
import { CONFIG } from "..";
import NotionFilters, { NotionColumns } from "./NotionFilters";
import Logger from "../utils/Logger";

export default class NotionClient extends Client {
    constructor() {
        super({
            auth: process.env.NOTION_TOKEN,
        });
    }

    getNotionMemberEvents = async () => {
        const info = await this.databases.query({
            database_id: CONFIG.notion.database_id,
            filter: NotionFilters.MEMBER_NEXT_MONTH,
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
                    Logger.once("util: getNotionMemberEvents", JSON.stringify(current, null, 2));
                    if (current.properties.Publish.type == "status"
                        && current.properties.Publish.status?.name == NotionColumns.publish.val_no_details) {
                        // publish without details
                        accumulator.push({
                            id: current.id,
                            startDate: (current.properties.Date.type == "date" && current.properties.Date.date?.start) || "",
                            endDate: (current.properties.Date.type == "date" && current.properties.Date.date?.end) || "",
                            notion_title: (current.properties.Topic.type == "title" && current.properties.Topic.title[0].plain_text) || "",
                            eplan: (current.properties["e-plan"].type == "select" && current.properties["e-plan"].select?.name) || "",
                            status: (current.properties.Status.type == "status" && current.properties.Status.status?.name) || "",
                            url: current.url,
                            location: "TBA",
                            public_description: "Details coming soon!",
                            public_title: "TBA :)",
                        })
                    } else {
                        // publish with details
                        accumulator.push({
                            id: current.id,
                            startDate: (current.properties.Date.type == "date" && current.properties.Date.date?.start) || "",
                            endDate: (current.properties.Date.type == "date" && current.properties.Date.date?.end) || "",
                            notion_title: (current.properties.Topic.type == "title" && current.properties.Topic.title[0].plain_text) || "",
                            eplan: (current.properties["e-plan"].type == "select" && current.properties["e-plan"].select?.name) || "",
                            status: (current.properties.Status.type == "status" && current.properties.Status.status?.name) || "",
                            url: current.url,
                            location: (current.properties.Location.type == "select" && current.properties.Location.select?.name) || "",
                            public_description: (current.properties["GCAL-Description"].type == "rich_text" && current.properties["GCAL-Description"].rich_text[0]?.plain_text) || "",
                            public_title: (current.properties["GCAL-Name"].type == "rich_text" && current.properties["GCAL-Name"].rich_text[0]?.plain_text) || "",
                        })
                    }

                }
                return accumulator;
            }, [] as NotionEvent[]);
    }
}

export interface NotionEvent {
    id: string,
    startDate: string,
    endDate: string,
    notion_title: string,
    eplan: string,
    status: string,
    url: string,
    location: string,
    public_description: string,
    public_title: string,
}