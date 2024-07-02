import { ApplicationCommandOptionType, CacheType, ChatInputCommandInteraction, PermissionFlagsBits, PermissionsBitField } from "discord.js";
import Command from "../classes/Command";
import DiscordClient from "../classes/DiscordClient";
import Category from "../enums/Category";

export default class Test extends Command {
    constructor(client: DiscordClient) {
        super(client, {
            name: "test",
            description: "Test command.",
            category: Category.Utilities,
            default_member_permissions: PermissionFlagsBits.UseApplicationCommands,
            dm_permission: true, // user can use commands in DMs?
            cooldown: 3,
            options: [
                {
                    name: "events",
                    description: "get event IDs",
                    type: ApplicationCommandOptionType.Subcommand
                },
                {
                    name: "two",
                    description: "OPT TWO!",
                    type: ApplicationCommandOptionType.Subcommand
                },
            ]
        })
    }
}