import CustomClient from "./base/classes/CustomClient";
import * as dotenv from "dotenv";
import NotionClient from "./notion/NotionClient";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

export const notionClient = new NotionClient();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
export const gemini = genAI.getGenerativeModel({ model: "models/gemini-pro" }, { apiVersion: "v1beta" });

(new CustomClient).Init();