import { Client, Collection, GatewayIntentBits } from "discord.js";
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
}