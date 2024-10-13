import DiscordClient from "../discord/classes/DiscordClient";

class Logger {

    static once = (prefix: string, msg: string) => {
        console.log(`[${prefix}] ${msg}`)
        return;
    }

    jobName: string;
    client: DiscordClient;
    onFinish: (fullLog: string, failed: boolean) => any;
    log = "";

    constructor(jobName: string, client: DiscordClient, onFinish: (fullLog: string, failed: boolean) => any) {
        this.jobName = jobName;
        this.client = client;
        this.onFinish = onFinish;
        this.log = "";
    }

    start() {
        const msg = `[${this.jobName}] Starting...`;
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

    error(attemptingTo: string, error: any) {
        const msg = `[${this.jobName} - ERROR] When attempting to ${attemptingTo}:`;
        console.error(msg);
        console.error(JSON.stringify(error, null, 2))
        this.log += msg + "\n" + JSON.stringify(error, null, 2) + "\n";
    }

    fail(message: string) {
        const msg = `[${this.jobName} - FAIL] ${message}`;
        console.error(msg);
        this.log += msg + "\n";
        this.onFinish(this.log, true);
    }

    end() {
        const msg = `[${this.jobName}] Completed.`;
        console.log(msg);
        this.log += msg + "\n";
        this.onFinish(this.log, false);
    }
}

export default Logger;

