import { Collection, GuildScheduledEvent, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel, GuildScheduledEventStatus } from "discord.js";
import DiscordClient from "../base/classes/DiscordClient";
import { NotionEvent } from "../notion/NotionClient";
import JobLogger from "./JobLogger";

const getDiscordEventsJob = (client: DiscordClient) => async () => {
    const logger = new JobLogger("Sync Discord Events");
    logger.start();

    // create a map of string to string
    // to store notion event id --> discord event id
    const notionIdToDiscordId = new Map<string, string>();
    const notionEvents = new Map<string, NotionEvent>();
    // list of the names of discord events that aren't from Notion (or invalid id)
    const discordWithoutNotion = [];

    const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID!);

    if (!guild) {
        logger.fatal("get the guild", "Guild not found.");
        return;
    }

    // fetch notion events
    let notionEventsRes = await client.notionClient.getNotionEvents()
        .catch((err) => { logger.fatal("get events from notion", err) });
    if (!notionEventsRes) return;

    // create a map of notion event id to the event object
    notionEventsRes.forEach(async event => {
        notionIdToDiscordId.set(event.id, "");
        notionEvents.set(event.id, event);
    });

    // fetch discord event scheduler
    let discordCurrentEventsRes = await guild.scheduledEvents.fetch()
        .catch((err) => { logger.fatal("get current Discord events", err) });
    if (!discordCurrentEventsRes) return;
    // iterate through the events and check if they have a notion id, log if they do/dont
    discordCurrentEventsRes.forEach((event) => {
        // check if this event has a notion page id
        const possibleNotionId = event.description?.split("!@NotionId:")[1];
        if (possibleNotionId && notionIdToDiscordId.has(possibleNotionId)) {
            // found a valid notion id for this discord event
            notionIdToDiscordId.set(possibleNotionId, event.id);
        } else {
            // no notion id found for this discord event
            discordWithoutNotion.push(event.name);
            logger.warn("Found Discord event with no/invalid Notion ID: " + event.name);
        }
    })

    // now we have a map of notion event id to discord event id
    // sync the Notion to Discord
    notionIdToDiscordId.forEach(async (discordId, notionId) => {
        if (!discordId) {
            // create a new event
            const notionEvent = notionEvents.get(notionId);
            if (!notionEvent) {
                logger.warn("Notion event not found for Notion ID: " + notionId + ". Skipping.");
                return;
            }

            let data = {
                name: notionEvent.topic || "Unknown topic",
                description: `!@NotionId:${notionEvent.id}`,
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
                    logger.fatal("create a new event on Discord", { "event data": data, "rest error": err })
                });
            if (!discordEventRes) return;
            // successfully created the event!
            logger.info(`Created event for Notion event "${notionEvent?.topic || "Unknown topic"}" (ID ${notionId})`);
            notionIdToDiscordId.set(notionId, discordEventRes.id);
        } else {
            // event already exists, update it!
            const NotionEvent = notionEvents.get(notionId);
            if (!NotionEvent) {
                logger.warn("Notion event not found for Notion ID: " + notionId + ". Skipping.");
                return;
            }

            let discordEvent = guild.scheduledEvents.cache.get(discordId);
            if (!discordEvent) {
                logger.warn("Discord event not found for Discord event ID: " + discordId + ". Skipping.");
                return;
            }

            // update the event
            let discordEditRes = await discordEvent.edit({
                name: NotionEvent.topic || "Unknown topic",
                description: `!@NotionId:${NotionEvent.id}`,
                privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
                entityType: GuildScheduledEventEntityType.External,
                scheduledStartTime: Date.parse(NotionEvent.startDate || ""),
                scheduledEndTime: Date.parse(NotionEvent.endDate || ""),
                entityMetadata: {
                    location: NotionEvent.location || "Unknown location",
                }
            })
                .catch((err) => { logger.fatal("update an existing event on Discord", err) });
            if (!discordEditRes) return;
            // successfully updated the event!
            logger.info(`Updated event for Notion event "${NotionEvent?.topic || "Unknown topic"}" (ID ${notionId})`);
        }
    })

}

export default getDiscordEventsJob;