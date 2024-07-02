import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import DiscordClient from "../classes/DiscordClient";
import Category from "../enums/Category";

export default interface ICommand {
    client: DiscordClient;
    name: string;
    description: string;
    category: Category;
    options: object;
    default_member_permissions: bigint;
    dm_permission: boolean;
    cooldown: number;

    Execute(interaction: ChatInputCommandInteraction): void;
    AutoComplete(interaction: AutocompleteInteraction): void;
}