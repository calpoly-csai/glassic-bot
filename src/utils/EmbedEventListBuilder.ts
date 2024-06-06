
/**
 * Builds a list of events for a Discord embed. The list is built in a format that can be passed 
 * directly to the `addFields` method of an `EmbedBuilder` object. The list is built in the format of:
 * 
 * **event date** 
 * > **[Event topic with URL](url)** \
 * > Event body line 1 \
 * > Event body line 2 \
 * > ...
 * 
 * repeated...
 *  
 */
export default class EmbedEventListBuilder {
    events: {
        date: string;
        topic: string | undefined;
        url: string;
        eventBody: string[];
    }[];

    constructor() {
        this.events = [];
    }

    addEvent(date: string, topic: string, url: string, eventBody: string[]) {
        this.events.push({ date, topic, url, eventBody: eventBody });
        return this;
    }

    addEvents(events: {
        date: string;
        topic: string;
        url: string;
        eventBody: string[];
    }[]) {
        this.events.push(...events);
        return this;
    }

    /**
     * @returns An array of fields that can be passed to the `addFields` method of an `EmbedBuilder` object.
     */
    build() {
        let fields = this.events
            .sort((a, b) => (new Date(a.date) < new Date(b.date) ? -1 : 1))
            .map((e) => {
                // todo catch poorly formatted dates
                const date = new Date(Date.parse(e.date || "??"));
                let title = ((date.toLocaleDateString("en-US", {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                }) || "Unknown"))

                let fieldBody = "";
                fieldBody += `> [${e.topic || "?? Unknown topic"}](${e.url})\n`
                e.eventBody.forEach((line) => {
                    fieldBody += `> ${line}\n`
                })
                // fields += `**${title}**\n${eventInfo}\n`

                return {
                    name: title,
                    value: fieldBody,
                }
            })
        return fields;
    }
}