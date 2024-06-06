import { CONFIG } from "..";
import DiscordClient from "../base/classes/DiscordClient";
import sendDiscordJobSummary from "./sendDiscordJobSummary";

class JobLogger {
    jobName: string;
    client: DiscordClient;
    log = "";

    constructor(jobName: string, client: DiscordClient) {
        this.jobName = jobName;
        this.client = client;
        this.log = "";
    }

    start() {
        const msg = `[${this.jobName}] Starting job...`;
        console.log(msg);
        this.log += msg + "\n";
    }

    info(message: string) {
        const msg = `[${this.jobName} - INFO] ${message}`;
        console.log(msg);
        this.log += msg + "\n";
    }

    warn(message: string) {
        const msg = `[${this.jobName} - WARN] ${message}`;
        console.warn(msg);
        this.log += msg + "\n";
    }

    error(attemptedThing: string, error: any) {
        const msg = `[${this.jobName} - ERROR] When attempting to ${attemptedThing}:`;
        console.error(msg);
        console.error(JSON.stringify(error, null, 2))
        this.log += msg + "\n" + JSON.stringify(error, null, 2) + "\n";
    }

    fail(message: string) {
        const msg = `[${this.jobName} - FAIL] ${message}`;
        console.error(msg);
        this.log += msg + "\n";
        this.logToDiscord();
    }

    end() {
        const msg = `[${this.jobName}] Job completed.`;
        console.log(msg);
        this.log += msg + "\n";
        this.logToDiscord();
    }

    logToDiscord() {
        sendDiscordJobSummary(
            this.client,
            CONFIG.discord.updates.bot_logs.channel_id,
            this.jobName,
            this.log
        );
    }
}

export default JobLogger;

