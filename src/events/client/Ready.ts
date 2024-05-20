import { Collection, Events, REST, Routes, TextChannel } from "discord.js";
import DiscordClient from "../../base/classes/DiscordClient";
import Event from "../../base/classes/Event";
import Command from "../../base/classes/Command";
import { RecurrenceRule, scheduleJob } from "node-schedule";
import notionEventsToDiscordEmbed from "../../utils/notionEventsToDiscordEmbed";

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
        let counter = 0;

        const rule = new RecurrenceRule();
        rule.minute = 15;
        rule.hour = 8;
        rule.tz = "America/Los_Angeles";

        const job = scheduleJob(rule, async () => {
            // set up interval message 
            var generalChannel = this.client.channels.cache.find(channel => channel.id === "1241586080743030878")!;

            const events = await this.client.notionClient.getNotionEvents();

            const embed = await notionEventsToDiscordEmbed(events);

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