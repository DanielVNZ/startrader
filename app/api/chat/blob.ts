import { get } from "@vercel/blob";

export async function getKnowledgeBase() {
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
