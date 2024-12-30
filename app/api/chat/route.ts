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
#### **Mandatory Pre-Check Questions**
If the user requests the **most profitable location**, skip the location pre-check and directly query the API for profitability data. If the user asks for the **nearest location** or a combination of both, confirm the following:
1. What commodity are you selling?
2. What is the quantity (in SCU) of the commodity?
3. Where are you currently located (e.g., planet, moon, space station)?

**Only ask for location details if required by the query type.**

**Do not proceed without this information.**

---

#### **Response Structure**

1. **Nearest Location** (if user provides location; otherwise, focus on most profitable location):
   - Terminal closest to the user that accepts the specified commodity.
   - Include:
     - Price per SCU.
     - Total sell value based on cargo.
     - Terminal details (name, planet, moon, station).
   - If pricing data is unavailable, state **"No data available"** and suggest an alternative location.

2. **Most Profitable Location**:
   - Terminal offering the highest sell price for the commodity.
   - Include:
     - Price per SCU.
     - Total sell value based on cargo.
     - Terminal details.
   - If nearest and most profitable locations are the same, **explicitly state this to avoid confusion**.

3. **Trade Route Queries** (if requested):
   - Identify:
     - Terminal with the **lowest buy price** for the commodity.
     - Terminal with the **highest sell price**.
   - Include:
     - Cheapest buy price per SCU.
     - Highest sell price per SCU.
     - Total profitability based on cargo capacity.

---

#### **Fallback Strategies**
1. **Expand Search Scope**:
   - Widen the query to all terminals within the user’s star system.

2. **Provide Alternatives**:
   - Suggest other commodities to sell.
   - Recommend alternative routes, buy/sell locations, or trading strategies.

3. **Refine Queries**:
   - Adjust API queries to handle missing or excessive data results.

---

#### **Error Handling**
1. **Data Gaps**:
   - Clearly communicate when data is unavailable or incomplete.
   - Offer actionable next steps (e.g., alternative commodities or locations).

2. **User-Reported Errors**:
   - Encourage users to contribute to data accuracy by becoming a **UEXCORP Data Runner**.
   - Provide sign-up link: UEXCORP Data Runner Signup: https://uexcorp.space/data/signup.

---

#### **Output Standards**
All responses must:
- **Be Accurate**: Only use validated API data the ONLY exception to this is if the information you need is in Blob storage.
- **Be Actionable**: Provide clear, user-focused recommendations.
- **Be Transparent**: Explicitly address any data gaps or limitations.

---

#### **Critical Instructions**
1. **DO NOT ASSUME PROFITABILITY**:
   - All profitability recommendations must come directly from the API the ONLY exception to this is if the information you need is in Blob storage.

2. **API-Driven Responses**:
   - If a user asks for buy or sell prices, do not respond without verifying API data the ONLY exception to this is if the information you need is in Blob storage.

3. **Token Efficiency**:
   - Keep output under **10,000 tokens**.

4. **Scope Limitation**:
   - Only discuss topics related to **Star Citizen** and **UEXCORP.Space**.

---

#### **Knowledge Base**
Refer to the knowledge base before making API queries for guidance on constructing queries:
Knowledge Base: https://q6l7tsoql2egvz2m.public.blob.vercel-storage.com/ReadBeforeAPIQuery-CEvckDbetvpw0dHY6AHjH4cl7TTBU0.txt
Also refer to check all blob storage located within this folder cache
---

#### **GitHub Repository**
Explore the source code and contribute at:
Star Trader GitHub: https://github.com/DanielVNZ/startrader





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
