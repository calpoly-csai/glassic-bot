import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import DiscordClient from "../base/classes/DiscordClient";
import SubCommand from "../base/classes/SubCommand";
import { isFullPage, isFullPageOrDatabase } from "@notionhq/client";
import notionEventsToDiscordEmbed from "../utils/notionEventsToDiscordEmbed";

export default class TestEvents extends SubCommand {
    constructor(client: DiscordClient) {
        super(client, {
            name: "test.events",
        })
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: false });
        const events = await this.client.notionClient.getNotionMemberEvents();
        const embed = await notionEventsToDiscordEmbed(events);
        interaction.editReply({ embeds: [embed] })
    }
}