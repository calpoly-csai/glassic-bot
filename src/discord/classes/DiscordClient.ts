import { Client, Collection, GatewayIntentBits, MessageCreateOptions, MessagePayload, TextChannel } from "discord.js";
import ICustomClient from "../interfaces/ICustomClient";
import Handler from "./Handler";
import Command from "./Command";
import SubCommand from "./SubCommand";
import NotionClient from "../../notion/NotionClient";
import LLM from "../../llm/LLM";
import Logger from "../../utils/Logger";
import MessageHandler from "../events/guild/MessageHandler";

export default class DiscordClient extends Client implements ICustomClient {
    handler: Handler;
    commands: Collection<string, Command>;
    subCommands: Collection<string, SubCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
    messageHandler: MessageHandler | null;

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

    sendMessage = async (channelId: string,
        options: string | MessagePayload | MessageCreateOptions,
        logger?: Logger
    ) => {
        const targetChannel = await this.channels.fetch(channelId);
        if (!targetChannel) {
            if (logger) {
                logger.error("send discord message", `Could not find channel with ID ${channelId}.`);
            } else {
                Logger.once("send discord message", `Could send message: could not find channel with ID ${channelId}.`);
            }
            return null;
        } if (!(targetChannel instanceof TextChannel)) {
            if (logger) {
                logger.error("send discord message", "The specified channel is not a text channel. Check the channel ID in the config/.env file?");
            } else {
                Logger.once("send discord message", "Could not send message: the specified channel is not a text channel. Check the channel ID in the config/.env file?");
            }
            return null;
        }

        const res = await (targetChannel as TextChannel).send(options)
            .catch((err) => {
                if (logger) {
                    logger.error("send discord message", `Error sending message to Discord:\n${JSON.stringify(err, null, 2)}`);
                } else {
                    Logger.once("send discord message", `Error sending message to Discord:\n${JSON.stringify(err, null, 2)}`);
                }
            });
        if (!res) {
            return null;
        } else {
            return res;
        }
    }
}