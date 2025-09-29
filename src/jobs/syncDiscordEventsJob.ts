import { Guild, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel } from "discord.js";
import DiscordClient from "../discord/classes/DiscordClient";
import { NotionEvent } from "../notion/NotionClient";
import Logger from "../utils/Logger";
import sendDiscordJobSummary from "./sendDiscordJobSummary";
import { CONFIG } from "..";

const NAME = "Sync Discord Events";

const getDiscordEventsJob = (client: DiscordClient, guild: Guild | null) => async () => {

    const whenDone = (log: string, success: boolean) =>
        sendDiscordJobSummary(
            client,
            CONFIG.discord.logs.channel_id,
            NAME,
            log
        );
    const logger = new Logger(NAME, client, whenDone);


    logger.start();
    let success_new = 0;
    let success_edit = 0;
    let fail = 0;

    // create a map of string to string
    // to store notion event id --> discord event id
    const notionIdToDiscordId = new Map<string, string>();
    const notionEvents = new Map<string, NotionEvent>();
    // list of the names of discord events that aren't from Notion (or invalid id)
    const discordWithoutNotion = [];

    if (!guild) {
        logger.fail("Failed to fetch guild - guild with provided ID not found?.");
        return;
    }

    // fetch notion events
    let notionEventsRes = await client.notionClient.getNotionMemberEvents()
        .catch((err) => { logger.error("get events from notion", err) });
    if (!notionEventsRes) {
        logger.fail("Failed to fetch Notion events.");
        return
    };

    // create a map of notion event id to the event object
    notionEventsRes.forEach(async event => {
        notionIdToDiscordId.set(event.id, "");
        notionEvents.set(event.id, event);
    });

    // fetch discord event scheduler
    let discordCurrentEventsRes = await guild.scheduledEvents.fetch()
        .catch((err) => { logger.error("get current Discord events", err) });
    if (!discordCurrentEventsRes) {
        logger.fail("Failed to fetch current Discord events.");
        return;
    };
    // iterate through the events and check if they have a notion id, log if they do/dont
    discordCurrentEventsRes.forEach((event) => {
        // check if this event has a notion page id
        try {
            const possibleNotionId = event.description?.split("!@NotionId:")[1].split("_")[0];
            if (possibleNotionId && notionIdToDiscordId.has(possibleNotionId)) {
                // found a valid notion id for this discord event
                notionIdToDiscordId.set(possibleNotionId, event.id);
            } else {
                throw new Error("No valid Notion ID found");
            }
        } catch (error) {
            // no notion id found for this discord event
            discordWithoutNotion.push(event.name);
            logger.warn("Found Discord event with no/invalid Notion ID: " + event.name);
        }
    })

    // now we have a map of notion event id to discord event id
    // sync the Notion to Discord
    for (const [notionId, discordId] of notionIdToDiscordId) {
        if (!discordId) {
            // create a new event
            const notionEvent = notionEvents.get(notionId);
            if (!notionEvent) {
                fail++;
                logger.warn("Notion event not found for Notion ID: " + notionId + ". Skipping.");
                continue;
            }

            let data = {
                name: notionEvent.public_title || "Unknown topic",
                description: `${notionEvent.public_description}\n\n_!@NotionId:${notionEvent.id}_`,
                privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
                entityType: GuildScheduledEventEntityType.External,
                scheduledStartTime: Date.parse(notionEvent.startDate || ""),
                scheduledEndTime: Date.parse(notionEvent.endDate || ""),
                entityMetadata: {
                    location: notionEvent.location || "Unknown location",
                }
            }
            let discordEventRes = await guild.scheduledEvents.create(data)
                .catch((err) => {
                    logger.error("create a new event on Discord", { "event data": data, "rest error": err })
                    fail++;
                });
            if (!discordEventRes) continue;
            // successfully created the event!
            logger.info(`Created event for Notion event "${notionEvent.public_title || "Unknown topic"}" (ID ${notionId})`);
            success_new++;
            notionIdToDiscordId.set(notionId, discordEventRes.id);
        } else {
            // event already exists, update it!
            const notionEvent = notionEvents.get(notionId);
            if (!notionEvent) {
                logger.warn("Notion event not found for Notion ID: " + notionId + ". Skipping.");
                fail++;
                continue;
            }

            let discordEvent = guild.scheduledEvents.cache.get(discordId);
            if (!discordEvent) {
                logger.warn("Discord event not found for Discord event ID: " + discordId + ". Skipping.");
                fail++;
                continue;
            }

            // update the event
            let discordEditRes = await discordEvent.edit({
                name: notionEvent.public_title || "Unknown topic",
                description: `${notionEvent.public_description}\n\n_!@NotionId:${notionEvent.id}_`,
                privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
                entityType: GuildScheduledEventEntityType.External,
                scheduledStartTime: Date.parse(notionEvent.startDate || ""),
                scheduledEndTime: Date.parse(notionEvent.endDate || ""),
                entityMetadata: {
                    location: notionEvent.location || "Unknown location",
                }
            })
                .catch((err) => { logger.error("update an existing event on Discord", err) });
            if (!discordEditRes) {
                fail++;
                continue;
            }
            // successfully updated the event!
            success_edit++;
            logger.info(`Updated event for Notion event "${notionEvent?.public_title || "Unknown topic"}" (ID ${notionId})`);
        }
    }
    logger.info(`Created ${success_new} new events, updated ${success_edit} existing events. Couldn't sync ${fail} events.`)
    logger.end();

}

export default getDiscordEventsJob;