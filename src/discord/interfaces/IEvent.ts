import { Events } from "discord.js";
import DiscordClient from "../classes/DiscordClient";

export default interface IEvent {
    client: DiscordClient;
    name: Events;
    description: string;
    once: boolean;
}