import { ChatInputCommandInteraction } from "discord.js";
import DiscordClient from "../classes/DiscordClient";

export default interface ISubCommand {
    client: DiscordClient;
    name: string;

    Execute(interaction: ChatInputCommandInteraction): void;

}
