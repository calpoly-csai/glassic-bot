import { ChatInputCommandInteraction, CacheType } from "discord.js";
import ISubCommand from "../interfaces/ISubCommand";
import DiscordClient from "./DiscordClient";
import ISubCommandOptions from "../interfaces/ISubCommandOptions";

export default class SubCommand implements ISubCommand {
    client: DiscordClient;
    name: string;

    constructor(client: DiscordClient, options: ISubCommandOptions) {
        this.client = client;
        this.name = options.name;
    }

    Execute(interaction: ChatInputCommandInteraction<CacheType>): void {
    }


}