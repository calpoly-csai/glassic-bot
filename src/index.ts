import CustomClient from "./base/classes/CustomClient";
import * as dotenv from "dotenv";
import NotionClient from "./notion/NotionClient";

dotenv.config();

export const notionClient = new NotionClient();

notionClient.getNotionEvents();

(new CustomClient).Init();