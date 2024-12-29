import { get } from "@vercel/blob";

async function getKnowledgeBase() {
  try {
    const blobName = "Knowledgebase/ReadBeforeAPIQuery.txt";

    // Fetch the blob
    const response = await get(blobName);

    if (!response?.body) {
      throw new Error("Blob content not found.");
    }

    // Convert blob body to text
    const content = await response.body.text();

    console.log("Knowledge Base Content:", content);
    return content;
  } catch (error) {
    console.error("Error fetching the knowledge base:", error);
    throw new Error("Failed to load the knowledge base from Vercel Blob.");
  }
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  let knowledgeBaseContent = "";
  try {
    knowledgeBaseContent = await getKnowledgeBase();
  } catch (error) {
    knowledgeBaseContent = "Knowledge base could not be loaded. Please try again later.";
  }

  const systemMessage = {
    role: "system",
    content: `
### Knowledge Base
${knowledgeBaseContent}

Please adhere to this information while assisting users.
`,
  };

  const extendedMessages = [systemMessage, ...messages];

  // Add GPT integration logic here
  console.log("Extended Messages:", extendedMessages);
}
