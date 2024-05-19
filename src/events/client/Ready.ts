import { Collection, Events, REST, Routes } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import Command from "../../base/classes/Command";

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