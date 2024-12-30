import { list, del } from "@vercel/blob";

const CACHE_FOLDER = "cache/"; // Replace with your folder prefix
const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds

export default async function handler(req, res) {
    // Log when the function starts
    console.log("Cleanup function triggered");

    // Optional: Verify the CRON_SECRET
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        console.log("Unauthorized request - missing or invalid CRON_SECRET");
        return res.status(401).end("Unauthorized");
    }

    try {
        console.log("Listing blobs in folder:", CACHE_FOLDER);
        const blobs = await list({ prefix: CACHE_FOLDER });
        console.log(`Found ${blobs.blobs.length} blobs in the folder.`);

        const now = Date.now();
        const deletedFiles = [];

        for (const blob of blobs.blobs) {
            const { pathname, lastModified } = blob;
            const fileAge = now - new Date(lastModified).getTime();

            console.log(`Checking file: ${pathname}, age: ${fileAge}ms`);

            // Check if the file is older than 1 hour
            if (fileAge > ONE_HOUR) {
                console.log(`Deleting file: ${pathname}`);
                await del(pathname); // Delete the file
                deletedFiles.push(pathname);
            }
        }

        console.log("Cleanup completed successfully. Deleted files:", deletedFiles);
        res.status(200).json({
            message: "Cleanup complete",
            deletedFiles,
        });
    } catch (error) {
        console.error("Error during cleanup:", error);
        res.status(500).json({
            error: "Failed to clean up files",
            details: error.message,
        });
    }
}
