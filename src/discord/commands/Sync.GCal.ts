import { ChatInputCommandInteraction } from "discord.js";
import DiscordClient from "../classes/DiscordClient";
import SubCommand from "../classes/SubCommand";

export default class SyncGCal extends SubCommand {
    constructor(client: DiscordClient) {
        super(client, {
            name: "sync.gcal",
        })
    }

    Execute(interaction: ChatInputCommandInteraction) {
        // interaction.reply({ content: "Syncing events from Notion to GCal. See logs in the bot logs channel.", ephemeral: true })
        interaction.reply({ content: "Coming soon!", ephemeral: true })
        // syncDiscordEventsJob(this.client);
    }
}