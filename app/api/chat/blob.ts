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
  