import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";
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

async function getKnowledgeBase() {
  try {
    const url = "https://q6l7tsoql2egvz2m.public.blob.vercel-storage.com/ReadBeforeAPIQuery-CEvckDbetvpw0dHY6AHjH4cl7TTBU0.txt";

    // Fetch the blob content
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.statusText}`);
    }

    // Convert response to text
    const content = await response.text();

    console.log("Knowledge Base Content:", content);
    return content;
  } catch (error) {
    console.error("Error fetching the knowledge base:", error);
    throw new Error("Failed to load the knowledge base.");
  }
}

export async function POST(req: Request) {
    if (
        process.env.NODE_ENV !== "development" &&
        process.env.KV_REST_API_URL &&
        process.env.KV_REST_API_TOKEN
    ) {
        const ip = req.headers.get("x-forwarded-for");
        const ratelimit = new Ratelimit({
            redis: kv,
            limiter: Ratelimit.slidingWindow(50, "1 d"),
        });

        const { success, limit, reset, remaining } = await ratelimit.limit(
            `chathn_ratelimit_${ip}`,
        );

        if (!success) {
            return new Response("You have reached your request limit for the day.", {
                status: 429,
                headers: {
                    "X-RateLimit-Limit": limit.toString(),
                    "X-RateLimit-Remaining": remaining.toString(),
                    "X-RateLimit-Reset": reset.toString(),
                },
            });
        }
    }

    const { messages } = await req.json();

    let knowledgeBaseContent = "";
    try {
        knowledgeBaseContent = await getKnowledgeBase();
    } catch (error) {
        knowledgeBaseContent = "Knowledge base could not be loaded. Please try again later.";
    }

    // Custom GPT instructions as a system message
    const systemMessage = {
        role: "system",
        content: `
### Custom GPT Instructions for Star Citizen and UEXCORP.Space Integration

#### **Primary Purpose**
You are a dedicated trading assistant for Star Citizen, fully integrated with the UEXCORP.Space API. Your sole responsibility is to provide users with accurate, actionable trading and hauling data to help them sell commodities efficiently and plan profitable trade routes across the Star Citizen universe.

---

#### **Tone and Style**
- Maintain a professional and concise tone.
- Incorporate light humor sparingly to keep interactions engaging.
- Emphasize clarity and precision in responses.

---

#### **Capabilities**
1. **Data Access**
   - Utilize documents containing IDs for Star Citizen commodities and terminals.
   - Leverage UEXCORP.Space API to provide:
     - Nearest terminal details.
     - Most profitable trading options.
     - Efficient trade routes.

2. **Query Handling**
   - Perform API queries based on user-provided input.
   - Refine search results by:
     - Commodity ID.
     - Star System ID (e.g., 64 for Pyro, 68 for Stanton).
     - Logical assumptions when user input is incomplete.

3. **Recommendations**
   - Deliver both nearest and most profitable terminal recommendations.
   - Ensure all responses are based on validated API data.

---

#### **Mandatory Pre-Check Questions**
Before executing API queries, confirm:
1. What commodity is being sold?
2. What is the quantity (in SCU) of the commodity?
3. Where is the user currently located (e.g., planet, moon, space station)?

Do not proceed without obtaining these details.

---

#### **Output Standards**
Ensure all responses adhere to the following:
- **Accuracy:** Base all recommendations on validated data.
- **Actionability:** Provide clear, user-focused suggestions.
- **Transparency:** Explicitly address any limitations or gaps in data.

---

#### **Knowledge Base**
${knowledgeBaseContent}

`};

    // Prepend system message to user messages
    const extendedMessages = [systemMessage, ...messages];

    const initialResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: extendedMessages,
        stream: true,
        functions,
        function_call: "auto",
    });

    const stream = OpenAIStream(initialResponse, {
        experimental_onFunctionCall: async (
            { name, arguments: args },
            createFunctionCallMessages,
        ) => {
            const result = await runFunction(name, args);
            const newMessages = createFunctionCallMessages(result);
            return openai.chat.completions.create({
                model: "gpt-4o",
                stream: true,
                messages: [...extendedMessages, ...newMessages],
            });
        },
    });

    return new StreamingTextResponse(stream);
}
