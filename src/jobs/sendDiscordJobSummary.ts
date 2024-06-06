import { TextChannel } from "discord.js";
import { CONFIG } from "..";
import DiscordClient from "../base/classes/DiscordClient";

const sendDiscordJobSummary = async (client: DiscordClient, channelId: string, situationName: string, log: string) => {
    var targetChannel = client.channels.cache.find(channel => channel.id === channelId)!;

    if (!targetChannel) {
        console.error(`[Send Discord Log Message] Could not find channel with ID ${channelId}.`);
        return;
    }

    const res = await client.llm.prompt(
        `Below are the logs of a job that you just ran. Please review the logs and respond in the following format:

Option 1: "SUCCESS/[MSG]" - respond this way if there were no errors.
Option 2: "FAIL/[MSG]" - respond this way if there were errors. 

Don't include the job name. Replace [MSG] with a summary of the job in this format:\
Successfully/Unsuccessfully did job: [job name].\
**Successes**
... bullet poinits with summaries of each success 
**Warnings**
... bullet points with summaries of each warning 
**Errors**
... bullet points with summaries of each error. do not include stack traces or the full JSON error, try to summarize the important parts.

If there are no bullets for a section, add a bullet point saying "None."
${log}`
    )
        .catch((err) => { console.error(`[Send Discord Log Message] Error sending prompt to LLM:\n`, JSON.stringify(err, null, 2)); });
    if (!res) return;

    let status = res.substring(0, res.indexOf("/"));
    let message = res.substring(res.indexOf("/") + 1);

    let roles = status == "SUCCESS" ? CONFIG.discord.updates.bot_logs.success_roles : CONFIG.discord.updates.bot_logs.error_roles;

    (targetChannel as TextChannel).send({
        content: roles.map(role => `<@&${role}>`).join(" ") + `${status == "SUCCESS" ? "✅" : "❌"}`,
        embeds: [{
            title: `Report for ${situationName}`,
            description: message,
            fields: []
        }]
    })
        .catch((err) => { console.error(`[Send Discord Log Message] Error sending message to Discord:\n`, JSON.stringify(err, null, 2)); });

    console.log(message);
}

export default sendDiscordJobSummary;