import { OpenAI } from "openai";
import {
    OpenAIStream,
    StreamingTextResponse,
} from "ai";
import { functions, runFunction } from "./functions";

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: Request) {
    const { messages } = await req.json();

    // Custom GPT instructions as a system message

    const recentMessages = messages.slice(-10);
    const systemMessage = {
        role: "system",
        content: `
You are an existing assistant named asst_PpKRF64sc768Djk09BS4QZXn. your context and files are uploaded to this assistant. 

`};

    const MAX_TPM = 30000; // Tokens per minute limit
    const MAX_OUTPUT_TOKENS = 2500; // Max tokens for the model's output
    const MAX_INPUT_TOKENS = MAX_TPM - MAX_OUTPUT_TOKENS; // Remaining tokens available for input

    // Limit message tokens
    const calculateTokens = (message: any) => message.content.length / 4; // Rough estimate (1 token = ~4 characters)
    let totalTokens = calculateTokens(systemMessage); // Start with systemMessage tokens
    const limitedMessages = [];

    for (const message of recentMessages.reverse()) {
        const messageTokens = calculateTokens(message);
        if (totalTokens + messageTokens > MAX_INPUT_TOKENS) break;
        limitedMessages.unshift(message);
        totalTokens += messageTokens;
    }

    const extendedMessages = [systemMessage, ...limitedMessages];

    const initialResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: extendedMessages,
        stream: true,
        functions,
        function_call: "auto",
        max_tokens: MAX_OUTPUT_TOKENS, // Enforce output token limit
    });

    await delay(2000); // Throttle the request to avoid hitting rate limits

    const stream = OpenAIStream(initialResponse, {
        experimental_onFunctionCall: async (
            { name, arguments: args },
            createFunctionCallMessages,
        ) => {
            const result = await runFunction(name, args);
            const newMessages = createFunctionCallMessages(result);

            // Recalculate tokens to stay within input limits for subsequent calls
            let totalTokens = calculateTokens(systemMessage);
            const adjustedMessages = [];

            for (const message of [...extendedMessages, ...newMessages].reverse()) {
                const messageTokens = calculateTokens(message);
                if (totalTokens + messageTokens > MAX_INPUT_TOKENS) break;
                adjustedMessages.unshift(message);
                totalTokens += messageTokens;
            }

            await delay(2000); // Throttle subsequent requests
            
            return openai.chat.completions.create({
                model: "gpt-4o",
                stream: true,
                messages: adjustedMessages,
                max_tokens: MAX_OUTPUT_TOKENS,
            });
        },
    });

    return new StreamingTextResponse(stream);
}
