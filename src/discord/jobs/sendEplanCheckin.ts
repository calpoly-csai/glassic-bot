import { EmbedBuilder, TextChannel } from "discord.js";
import DiscordClient from "../classes/DiscordClient";
import { NotionEvent } from "../../notion/NotionClient";
import Logger from "../../utils/Logger";
import EmbedEventListBuilder from "../../utils/EmbedEventListBuilder";
import { CONFIG } from "../..";
import sendDiscordJobSummary from "./sendDiscordJobSummary";

const NAME = "Send Eplan Checkin";

const getEplanCheckinJob = (client: DiscordClient) => async () => {
    const whenDone = (log: string, success: boolean) =>
        sendDiscordJobSummary(
            client,
            CONFIG.discord.updates.bot_logs.channel_id,
            NAME,
            log
        );

    const logger = new Logger(NAME, client, whenDone);
    logger.start();

    // const notionEvents = new Map<string, NotionEvent>();
    logger.info("Fetching Notion events...");
    let notionEventsRes = await client.notionClient.getNotionMemberEvents()
        .catch((err) => { logger.error("get events from notion", err) });
    if (!notionEventsRes) {
        logger.fail("Failed to fetch Notion events.");
        return;
    }

    // filter notion events into those that start within the next 2 weeks and those that dont
    const now = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(now.getDate() + 14);

    let soonEvents: NotionEvent[] = [];
    let laterEvents: NotionEvent[] = [];

    notionEventsRes.forEach(event => {
        if (new Date(event.startDate) <= twoWeeksFromNow) {
            soonEvents.push(event);
        } else {
            laterEvents.push(event);
        }
    })

    // get the eplan channel
    const eplanChannel = client.channels.cache.get(CONFIG.discord.updates.eplans.channel_id);
    if (!eplanChannel) {
        logger.fail("Failed to fetch eplan channel - channel with provided ID not found?.");
        return;
    }

    // @ role with: `<@&${role id}>`

    // build embed with soon events and if eplan is "todo" or "confirmed"
    // send embed to eplan channel

    let embed = new EmbedBuilder().setColor("Blue");
    let allGood = true;

    const eplanMsg = (eplan: string) => {
        switch (eplan) {
            case "Confirmed":
                return "✅ E-plan: confirmed";
            case "Todo":
                allGood = false;
                return "❌ E-plan: todo";
            default:
                allGood = false;
                return "❌ E-plan: no status";
        }
    }

    if (!soonEvents.length) {
        embed.addFields({
            name: "No events",
            value: "No upcoming events in the next month",
        })
    } else {
        let builder = new EmbedEventListBuilder()
            .addEvents(soonEvents.map((e) => ({
                date: e.startDate,
                topic: e.notion_title,
                url: e.url,
                eventBody: [
                    `${eplanMsg(e.eplan)}`,
                ]

            })));

        embed.addFields(builder.build());
    }

    let msgContent;

    if (allGood) {
        logger.info("Successfully detected that eplans for upcoming events are all confirmed.");
        msgContent = "✅ All eplans for upcoming events are confirmed.";
    } else {
        logger.info("Successfully detected that some eplans are not confirmed.");
        msgContent = `<@&${CONFIG.discord.updates.eplans.role_id}> Some upcoming events have unconfirmed e-plans:`;
    }


    var targetChannel = client.channels.cache.find(channel => channel.id === CONFIG.discord.updates.eplans.channel_id);
    if (!targetChannel) {
        logger.fail(`Could not find channel with ID ${CONFIG.discord.updates.eplans.channel_id}.`);
        return;
    }

    client.sendMessage(
        CONFIG.discord.updates.eplans.channel_id,
        {
            content: msgContent,
            embeds: [embed]
        },
        logger
    );

    logger.info("Successfully sent eplan checkin message to Discord.");
    logger.end();
}

export default getEplanCheckinJob;