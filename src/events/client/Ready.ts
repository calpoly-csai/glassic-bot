import { Collection, EmbedBuilder, Events, REST, Routes, TextChannel } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import Command from "../../base/classes/Command";
import { scheduleJob } from "node-schedule";
import { notionClient } from "../..";
import { isFullPage } from "@notionhq/client";
import { statusToEmoji } from "../../notion/NotionClient";

export default class Ready extends Event {
    constructor(client: CustomClient) {
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
        let counter = 0;

        const job = scheduleJob('15 * * * * *', async () => {
            // set up interval message 
            var generalChannel = this.client.channels.cache.find(channel => channel.id === "1241586080743030878")!;

            const events = await notionClient.getNotionEvents();

            let embed = new EmbedBuilder().setColor("Blue");

            events.results.forEach((e) => {
                if (!isFullPage(e)) return;

                let topic = e.properties.Topic;
                if (!(topic.type == "title")) return;
                let dateString = e.properties.Date;
                if (!(dateString.type == "date")) return;
                const status = e.properties.Status;
                if (!(status.type == "status")) return;

                console.log(e);
                console.log(dateString);
                const date = new Date(Date.parse(dateString.date?.start || "??"));

                let title = ((date.toLocaleDateString("en-US", {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                }) || "Unknown"))

                embed.addFields({
                    name: title,
                    value: `> ${statusToEmoji(status.status?.name)} [${topic.title[0].plain_text}](${e.url})`
                })
            })


            if ((generalChannel instanceof TextChannel)) {

                (generalChannel as TextChannel).send({
                    content: `Message schedule to send every minute at :15 (upcount: ${counter++}).`
                    , embeds: [embed]
                });
            }
        });

        console.log("Successfully set up interval message.")

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