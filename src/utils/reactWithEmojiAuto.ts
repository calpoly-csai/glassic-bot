import { Message } from "discord.js";
import DiscordClient from "../base/classes/DiscordClient";

/**
 * Automatically react to a Discord message with 3 relevant emoji.
 * @param message the message to react to
 */
export const reactWithEmojiAuto = async (client: DiscordClient, message: Message) => {
    const res = await client.llm.prompt("Below is a message sent on the discord server. Please come up with 3 \
    emojis that relate to the message, based on the message content, separated by commas. \
    Please respond in the format: emoji1,emoji2,emoji3\
    Example response: 👍,💃,✨\
    Message: " + message.content);
    if (res) {
        const emojis = res.trim().split(",");
        console.log("[AutoReact] Reacting to message with emojis: ", emojis);
        emojis.forEach((emoji) => {
            message.react(emoji)
                .catch((err) => {
                    console.error("[AutoReact] Error reacting to message: ", JSON.stringify(err, null, 2));
                });
        });
    } else {
        console.error("[AutoReact] LLM didn't respond with a message.");
    }


}