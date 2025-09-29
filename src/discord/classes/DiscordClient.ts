import { Client, Collection, Events, GatewayIntentBits, MessageCreateOptions, MessagePayload, TextChannel } from "discord.js";
import ICustomClient from "../interfaces/ICustomClient";
import Handler from "./Handler";
import Command from "./Command";
import SubCommand from "./SubCommand";
import NotionClient from "../../notion/NotionClient";
import LLM from "../../llm/LLM";
import Logger from "../../utils/Logger";
import MessageHandler from "../events/guild/MessageHandler";
import ReactionHandler from "../events/guild/ReactionHandler";

export default class DiscordClient extends Client implements ICustomClient {
    handler: Handler;
    commands: Collection<string, Command>;
    subCommands: Collection<string, SubCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
    messageHandler: MessageHandler | null;
    reactionHandler: ReactionHandler | null;

    notionClient: NotionClient;
    llm: LLM;

    constructor(notionClient: NotionClient, llm: LLM) {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildScheduledEvents,
                GatewayIntentBits.GuildMessageReactions,
            ]
        });
        this.handler = new Handler(this);
        this.commands = new Collection();
        this.subCommands = new Collection();
        this.cooldowns = new Collection();

        this.messageHandler = null;
        this.reactionHandler = null;
        this.notionClient = notionClient;
        this.llm = llm;
    }

    Init(): void {
        this.LoadHandlers();
        Logger.once("setup", "logging in");
        this.login(process.env.DISCORD_APP_TOKEN)
            .catch(err => console.error(err));
    }

    LoadHandlers(): void {
        this.handler.LoadEvents();
        this.handler.LoadCommands();
    }

    sendMessage = async (
        channelId: string,
        discordOptions: string | MessagePayload | MessageCreateOptions,
        logger?: Logger,
        reactionCallbacks?: Map<string, ReactionCallbackInfo>
    ) => {
        const targetChannel = await this.channels.fetch(channelId);
        const logError = logger ? logger.error : Logger.once;
        const logInfo = (a: string, b: string) => logger ? logger.info(b) : Logger.once(a, b);

        if (logger){
            console.log("trying to log with", typeof logger, logger?.jobName);
        } else {
            console.log("Running without logger");
        }

        if (!targetChannel) {
            logError("send discord message", `Could not find channel with ID ${channelId}.`);
            return null;
        } if (!(targetChannel instanceof TextChannel)) {
            logError("send discord message", `The specified channel  ${channelId} is not a text channel. Check the channel ID in the config/.env file?`);
            return null;
        }

        const res = await (targetChannel as TextChannel).send(discordOptions)
            .catch((err) => {
                logError("send discord message", err)
            });
        if (!res) {
            // error sending discord message
            return null;
        }

        if (reactionCallbacks) {
            reactionCallbacks.forEach((callbackInfo, emoji) => {
                if (!this.reactionHandler) {
                    logError("setup msg reaction action", "No message handler found to listen for reactions.");
                    return res;
                }

                this.reactionHandler.addListener(
                    res.id,
                    callbackInfo.onReact,
                    callbackInfo.timeout,
                );

                if (callbackInfo.autoReact) {
                    res.react(emoji);
                }
            })
        }

        logInfo("send discord message", "Successfully sent message to Discord.");

        return res;
    }
}

type ReactionCallbackInfo = {
    onReact: () => boolean;
    autoReact: boolean;
    timeout?: number;
}