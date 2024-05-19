import { ChatInputCommandInteraction } from "discord.js";
import CustomClient from "../base/classes/CustomClient";
import SubCommand from "../base/classes/SubCommand";

export default class TestOne extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "test.one",
        })
    }

    Execute(interaction: ChatInputCommandInteraction) {
        interaction.reply({ content: "Test [subcommand one] command executed!", ephemeral: true })
    }
}