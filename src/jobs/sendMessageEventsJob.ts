import { EmbedBuilder, TextChannel } from "discord.js";
import notionEventsToDiscordEmbed from "../utils/notionEventsToDiscordEmbed";
import DiscordClient from "../base/classes/DiscordClient";
import JobLogger from "./JobLogger";

const getMessageEventsJob = (client: DiscordClient, channelId: string) => async () => {
    var targetChannel = client.channels.cache.find(channel => channel.id === channelId)!;
    var log = new JobLogger("Send Weekly Events Message", client);

    if (!(targetChannel instanceof TextChannel)) {
        log.fail("The specified channel is not a text channel. Check the channel ID in the config/.env file.");
        return;
    }

    // get the events from Notion and paraphrase the message
    let doubleRes = await Promise.all([
        await notionEventsToDiscordEmbed(await client.notionClient.getNotionEvents()),
        await client.llm.paraphrase("Here's what's coming up in the next month:"),
    ]).catch((err) => { log.error("fetch Notion Events and LLM paraphrase", err); })
    if (!doubleRes) {
        log.fail("Failed to fetch Notion events and paraphrase the message.");
        return;
    };
    const [embed, content] = doubleRes;

    // send the message to the channel
    let sendRes = await targetChannel.send({ content: content, embeds: [embed] })
        .catch((err) => { log.error("send a message to Discord", err); });
    if (!sendRes) {
        log.fail("Failed to send message to Discord.");
        return;
    };

    // done
    log.info("Sent message.");
    log.end();
}



export default getMessageEventsJob;