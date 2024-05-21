import { Client, Collection, GatewayIntentBits } from "discord.js";
import ICustomClient from "../interfaces/ICustomClient";
import Handler from "./Handler";
import Command from "./Command";
import SubCommand from "./SubCommand";
import NotionClient from "../../notion/NotionClient";
import LLM from "../../llm/LLM";

export default class DiscordClient extends Client implements ICustomClient {
    handler: Handler;
    commands: Collection<string, Command>;
    subCommands: Collection<string, SubCommand>;
    cooldowns: Collection<string, Collection<string, number>>;

    notionClient: NotionClient;
    llm: LLM;

    constructor(notionClient: NotionClient, llm: LLM) {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildScheduledEvents]
        });
        this.handler = new Handler(this);
        this.commands = new Collection();
        this.subCommands = new Collection();
        this.cooldowns = new Collection();

        this.notionClient = notionClient;
        this.llm = llm;
    }

    Init(): void {
        this.LoadHandlers();


        console.log("Registering commands with app token")
        console.log(process.env.DISCORD_APP_TOKEN!)

        this.login(process.env.DISCORD_APP_TOKEN)
            .catch(err => console.error(err));
    }

    LoadHandlers(): void {
        this.handler.LoadEvents();
        this.handler.LoadCommands();
    }
}