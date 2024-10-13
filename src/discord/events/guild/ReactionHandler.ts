import { Events, Interaction, MessageReaction, PartialMessageReaction } from "discord.js";
import Event from "../../classes/Event";
import DiscordClient from "../../classes/DiscordClient";
import Logger from "../../../utils/Logger";


export default class ReactionHandler extends Event {
    private listeners: Map<string, (int: MessageReaction | PartialMessageReaction) => any>;

    constructor(client: DiscordClient) {
        super(
            client,
            {
                name: Events.MessageReactionAdd,
                description: "Reaction handler event.",
                once: false,
            }
        )
        this.listeners = new Map();

        Logger.once("reactionHandler setup", "created reaction handler.");
    }

    async Execute(interaction: MessageReaction | PartialMessageReaction) {
        // check if there's a listener for the message and interaction
        if (this.listeners.has(interaction.message.id)) {
            this.listeners.get(interaction.message.id)?.call(this, interaction);
        }
    }

    addListener(
        msgId: string,
        listener: (msg: MessageReaction | PartialMessageReaction) => Promise<boolean> | boolean,
        timeout: number = 43200000, // default 12 hour timeout
    ) {
        this.listeners.set(msgId,
            async (msg: MessageReaction | PartialMessageReaction) => {
                let remove = await listener(msg);
                if (remove) {
                    this.listeners.delete(msgId);
                }
            }
        )
        return;
    }

}