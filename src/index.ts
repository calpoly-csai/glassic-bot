import DiscordClient from "./base/classes/DiscordClient";
import * as dotenv from "dotenv";
import NotionClient from "./notion/NotionClient";
import Gemini from "./llm/Gemini";
import { IConfig } from "./base/interfaces/IConfig";

dotenv.config();

const notionClient = new NotionClient();
const gemini = new Gemini();
export const CONFIG: IConfig = require(`${process.cwd()}/config.json`);

(new DiscordClient(notionClient, gemini)).Init();