import { Collection, Events, GuildScheduledEventEntityType, GuildScheduledEventManager, GuildScheduledEventPrivacyLevel, REST, Routes, TextChannel } from "discord.js";
import DiscordClient from "../../base/classes/DiscordClient";
import Event from "../../base/classes/Event";
import Command from "../../base/classes/Command";
import { RecurrenceRule, scheduleJob } from "node-schedule";
import notionEventsToDiscordEmbed from "../../utils/notionEventsToDiscordEmbed";
import { isFullPage } from "@notionhq/client";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { NotionEvent } from "../../notion/NotionClient";

export default class Ready extends Event {
    constructor(client: DiscordClient) {
        super(client,
            {
                name: Events.ClientReady,
                description: "Event that gets emitted when the client is ready.",
                once: true
            });
    }

    async Execute() {
        console.log(`${this.client.user?.tag} is ready!`);

        // format the commands into JSON to send tot discord
        const commands: object[] = this.GetJson(this.client.commands);

        if (!this.verifySecrets()) return;

        const rest = new REST().setToken(process.env.DISCORD_APP_TOKEN!);

        const setCommands: any = await rest.put(Routes.applicationGuildCommands(
            process.env.DISCORD_CLIENT_ID!,
            process.env.DISCORD_GUILD_ID!,
        ), {
            body: commands
        });

        console.log(`Successfully registered ${setCommands.length} commands.`)

        this.setupSync();

    }

    private setupSync = () => {

        const rule = new RecurrenceRule();
        rule.minute = 15;
        rule.hour = 8;
        rule.tz = "America/Los_Angeles";

        const sendEventsMessageJob = scheduleJob(rule, async () => {
            // set up interval message 
            var generalChannel = this.client.channels.cache.find(channel => channel.id === "1241586080743030878")!;

            const [embed, content] = await Promise.all([
                await notionEventsToDiscordEmbed(await this.client.notionClient.getNotionEvents()),
                await this.client.llm.paraphrase("Here's what's coming up in the next month:"),
            ]);

            if ((generalChannel instanceof TextChannel)) {
                (generalChannel as TextChannel).send({
                    content: content
                    , embeds: [embed]
                });
            }
        });

        console.log("Successfully set up interval message.")

        const syncDiscordEventsJob = scheduleJob(rule, async () => {
            console.log("Syncing events...");
            // create a map of string to string
            // to store notion event id --> discord event id
            const notionIdToDiscordId = new Map<string, string>();
            const notionEvents = new Map<string, NotionEvent>();
            // list of the names of discord events that aren't from Notion (or invalid id)
            const discordWithoutNotion = [];

            const guild = this.client.guilds.cache.get(process.env.DISCORD_GUILD_ID!);

            if (!guild) {
                console.error("Tried to sync events, but specified server (guild ID) not found. Verify your guild ID in the .env file.");
                return;
            }

            let notionEventsQuery = await this.client.notionClient.getNotionEvents();
            notionEventsQuery.forEach(async event => {
                notionIdToDiscordId.set(event.id, "");
                notionEvents.set(event.id, event);
            });

            let discordEvents = await guild.scheduledEvents.fetch();
            discordEvents.forEach((event) => {
                // check if this event has a notion page id
                const possibleNotionId = event.description?.split("!@NotionId:")[1];
                if (possibleNotionId && notionIdToDiscordId.has(possibleNotionId)) {
                    notionIdToDiscordId.set(possibleNotionId, event.id);
                } else {
                    discordWithoutNotion.push(event.name);
                    console.log("[SYNC] Found Discord event with no/invalid Notion ID: " + event.name)
                }
            })

            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const tomorrowAndOneHour = new Date(tomorrow);
            tomorrowAndOneHour.setHours(tomorrow.getHours() + 1);

            notionIdToDiscordId.forEach(async (discordId, notionId) => {
                if (!discordId) {
                    // create a new event
                    const notionEvent = notionEvents.get(notionId);
                    const event = await guild.scheduledEvents.create({
                        name: notionEvent?.topic || "Unknown topic",
                        description: `!@NotionId:${notionId}`,
                        // time: new Date(),
                        privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
                        entityType: GuildScheduledEventEntityType.External,
                        scheduledStartTime: Date.parse(notionEvent?.startDate || ""), // TODO get the actual start time from notion
                        scheduledEndTime: Date.parse(notionEvent?.endDate || ""), // TODO get the actual start time from notion
                        entityMetadata: {
                            location: "TBA"
                        }
                    });
                    notionIdToDiscordId.set(notionId, event.id);
                    console.log("[SYNC] Created Discord event for Notion event with ID: " + notionId);
                }
            })
        })
        console.log("Successfully set up interval sync.")

    }


    private GetJson(commands: Collection<string, Command>): object[] {
        const data: object[] = [];

        commands.forEach(command => {
            data.push({
                name: command.name,
                description: command.description,
                options: command.options,
                default_member_permissions: command.default_member_permissions.toString(),
                dm_permission: command.dm_permission,
            })
        })

        return data;
    }

    private verifySecrets(): boolean {

        if (!process.env.DISCORD_APP_TOKEN) {
            console.error("Discord app token is missing.");
            return false;
        }

        if (!process.env.DISCORD_CLIENT_ID) {
            console.error("Discord client id is missing.");
            return false;
        }

        if (!process.env.DISCORD_GUILD_ID) {
            console.error("Discord guild id is missing.");
            return false;
        }

        return true;
    }

}