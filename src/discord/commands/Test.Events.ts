import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { isFullPage, isFullPageOrDatabase } from "@notionhq/client";
import notionEventsToDiscordEmbed from "../../utils/notionEventsToDiscordEmbed";
import DiscordClient from "../classes/DiscordClient";
import SubCommand from "../classes/SubCommand";

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