import DiscordClient from "./base/classes/DiscordClient";
import * as dotenv from "dotenv";
import NotionClient from "./notion/NotionClient";
import Gemini from "./llm/Gemini";

dotenv.config();

const notionClient = new NotionClient();
const gemini = new Gemini();

(new DiscordClient(notionClient, gemini)).Init();