class JobLogger {
    jobName: string;

    constructor(jobName: string) {
        this.jobName = jobName;
    }

    start() {
        console.log(`[${this.jobName}] Starting job...`);
    }

    info(message: string) {
        console.log(`[${this.jobName} - INFO] ${message}`);
    }

    warn(message: string) {
        console.warn(`[${this.jobName} - WARN] ${message}`);
    }

    error(attemptedThing: string, error: any) {
        console.error(`[${this.jobName} - ERROR] When attempting to ${attemptedThing}:`);
        console.error(JSON.stringify(error, null, 2))
    }

    fatal(attemptedThing: string, error: any) {
        this.error(attemptedThing, error);
        this.fail("Fatal error occurred.");
    }

    fail(message: string) {
        console.error(`[${this.jobName} - FAIL] ${message}`);
    }

    end() {
        console.log(`[${this.jobName}] Job completed.`);
    }
}

export default JobLogger;

