export default interface LLM {

    prompt(p: string): Promise<string>;
    paraphrase(p: string, n?: number): Promise<string>;
}