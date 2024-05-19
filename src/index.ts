import CustomClient from "./base/classes/CustomClient";
import * as dotenv from "dotenv";
import NotionClient from "./notion/NotionClient";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

export const notionClient = new NotionClient();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
export const gemini = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    systemInstruction: "You are a Discord bot named Glass, "
        + "tasked with helping the Computer Science and Artificial Intelligence Club (CS+AI) "
        + "manage their Discord server, Google Calendar, and Notion workspace. "
        + "You can respond to prompts in two ways, in these formats: \n"
        + "option 1: \"MSG:[response]\" : respond to a prompt with a message, as usual.\n"
        + "option 2: \"CMD:[command]\" : call a command. commands available to you include: \n"
        + " - events: send the user a list of upcoming events and their status\n"
        + "please choose to respond in the format of option 1 or option 2, whichever is appropriate."
        + "Remember, you haven't been set up to do anything conversational, "
        + "so you can just respond to one prompt at a time. You'll have no context from previou prompts."
        + "do not prompt the user to execute commands.",
}, { apiVersion: "v1beta" });

(new CustomClient).Init();