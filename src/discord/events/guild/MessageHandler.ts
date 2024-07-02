import { Events, Message } from "discord.js";
import Event from "../../classes/Event";
import DiscordClient from "../../classes/DiscordClient";
import notionEventsToDiscordEmbed from "../../../utils/notionEventsToDiscordEmbed";
import { reactWithEmojiAuto } from "../../../utils/reactWithEmojiAuto";
import { CONFIG } from "../../..";

export default class MessageHandler extends Event {
    autoReactChannels: Set<string>;
    constructor(client: DiscordClient) {
        super(client, {
            name: Events.MessageCreate,
            description: "Message handler event.",
            once: false,
        })
        console.log("created message handler.")

        this.autoReactChannels = new Set(CONFIG.discord.auto_reaction_channel_ids)
        console.log("autoReactChannels: ", this.autoReactChannels)
    }

    async Execute(msg: Message) {
        if (msg.content.startsWith("!g")) {
            const prompt = msg.content.slice(3);
            const text = await this.client.llm.prompt(prompt, new Map([[
                "list-member-events", async () => {
                    const events = await this.client.notionClient.getNotionMemberEvents();
                    const embed = await notionEventsToDiscordEmbed(events);

                    msg.reply({
                        content: `Here's what's coming in the next few weeks:`
                        , embeds: [embed]
                    });
                }
            ]]));

            if (!text) {
                return;
            }

            msg.reply(text);
        } else if (!msg.author.bot && this.autoReactChannels.has(msg.channelId.trim())) {
            // ensure the author is not a bot, react if no
            reactWithEmojiAuto(this.client, msg);
        }

    }
}