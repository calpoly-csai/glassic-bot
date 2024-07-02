import { glob } from "glob";
import IHandler from "../interfaces/IHandler";
import path from "path";
import DiscordClient from "./DiscordClient";
import Event from "./Event";
import SubCommand from "./SubCommand";
import Command from "./Command";

export default class Handler implements IHandler {
    client: DiscordClient;

    constructor(client: DiscordClient) {
        this.client = client;
    }

    async LoadEvents() {
        const files = (await glob(`build/discord/events/**/*.js`)).map(filePath => path.resolve(filePath));

        files.map(async (file: string) => {
            const event: Event = new (await import(file)).default(this.client);

            if (!event.name) {
                return delete require.cache[require.resolve(file)] && console.error(`${file.split("/").pop()} does not have a name.`);
            }

            const execute = (...args: any) => event.Execute(...args);

            if (event.once) {
                // @ts-ignore
                this.client.once(event.name, execute);
            } else {
                // @ts-ignore
                this.client.on(event.name, execute);
            }

            return delete require.cache[require.resolve(file)];
        })
    }

    async LoadCommands() {
        const files = (await glob(`build/discord/commands/**/*.js`)).map(filePath => path.resolve(filePath));

        files.map(async (file: string) => {
            const command: Command | SubCommand = new (await import(file)).default(this.client);

            if (!command.name) {
                return delete require.cache[require.resolve(file)] && console.error(`${file.split("/").pop()} does not have a name.`);
            }

            // load subcommands
            // find the last part of the file name
            // if it has a third part, it's a subcommand
            if (file.split("/").pop()?.split(".")[2]) {
                return this.client.subCommands.set(command.name, command)
            } else {
                this.client.commands.set(command.name, command as Command);
            }

            // TODO check if else should return above!!!
            return delete require.cache[require.resolve(file)];
        })
    }
}