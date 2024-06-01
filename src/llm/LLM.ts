export default interface LLM {

    prompt(p: string, cmds?: Map<string, () => string>): Promise<string>;
    paraphrase(p: string, n?: number, cmds?: Map<string, () => string>): Promise<string>;
}