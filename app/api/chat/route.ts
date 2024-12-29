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

export async function POST(req: Request) {
    const { messages } = await req.json();

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

DO NOT ASSUME THAT A LOCATION IS PROFITABLE. YOU MUST USE API VALUES ONLY. 

---

#### **Knowledge Base**
For detailed information, refer to the knowledge base at the following link:
https://q6l7tsoql2egvz2m.public.blob.vercel-storage.com/ReadBeforeAPIQuery-CEvckDbetvpw0dHY6AHjH4cl7TTBU0.txt

`};

    // Include all messages without truncation
    const extendedMessages = [systemMessage, ...messages];

    const initialResponse = await openai.chat.completions.create({
        model: "gpt-4o",
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
