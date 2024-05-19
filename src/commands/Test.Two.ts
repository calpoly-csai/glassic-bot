import { ChatInputCommandInteraction } from "discord.js";
import DiscordClient from "../base/classes/DiscordClient";
import SubCommand from "../base/classes/SubCommand";

export default class TestTwo extends SubCommand {
    constructor(client: DiscordClient) {
        super(client, {
            name: "test.two",
        })
    }

    Execute(interaction: ChatInputCommandInteraction) {
        interaction.reply({ content: "Test [subcommand two] command executed!", ephemeral: true })
    }
}