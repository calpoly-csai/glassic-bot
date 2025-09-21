import { ChatInputCommandInteraction } from "discord.js";
import DiscordClient from "../classes/DiscordClient";
import SubCommand from "../classes/SubCommand";
import getDiscordEventsJob from "../../jobs/syncDiscordEventsJob";
import { CONFIG } from "../..";

export default class SyncDiscord extends SubCommand {
    constructor(client: DiscordClient) {
        super(client, {
            name: "sync.discord",
        })
    }

    Execute(interaction: ChatInputCommandInteraction) {
        interaction.reply({ content: `Syncing events from Notion to Discord. See logs in <#${CONFIG.discord.logs.channel_id}>.`, ephemeral: true })
        getDiscordEventsJob(this.client, interaction.guild)();
    }
}