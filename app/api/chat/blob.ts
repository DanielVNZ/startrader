let cachedKnowledgeBase = ""; // Cache the knowledge base globally

async function getKnowledgeBase() {
  if (cachedKnowledgeBase) {
    return cachedKnowledgeBase.slice(0, 500) + "... [truncated]"; // Use cached and truncated content
  }

  try {
    const url = "https://q6l7tsoql2egvz2m.public.blob.vercel-storage.com/ReadBeforeAPIQuery-CEvckDbetvpw0dHY6AHjH4cl7TTBU0.txt";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.statusText}`);
    }

    let content = await response.text();
    cachedKnowledgeBase = content; // Cache the full content
    return content.slice(0, 500) + "... [truncated]"; // Return truncated content
  } catch (error) {
    console.error("Error fetching the knowledge base:", error);
    throw new Error("Failed to load the knowledge base.");
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
  
  Please Read this BEFORE calling an API. This information will help you fine tine what you send through the API. 
  `,
    };
  
    const extendedMessages = [systemMessage, ...messages];
  
    // Add GPT integration logic here
    console.log("Extended Messages:", extendedMessages);
  }
  