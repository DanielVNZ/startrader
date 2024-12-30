import { NextRequest, NextResponse } from "next/server";
import { list, del } from "@vercel/blob";

const CACHE_FOLDER = "cache/";
const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        console.log("Unauthorized request - missing or invalid CRON_SECRET");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        console.log("Starting cleanup process for folder:", CACHE_FOLDER);

        const blobs = await list({ prefix: CACHE_FOLDER });
        console.log(`Found ${blobs.blobs.length} files in all subfolders.`);

        const now = Date.now();
        const deletedFiles: string[] = [];

        for (const blob of blobs.blobs) {
            const { pathname } = blob;

            // Extract timestamp from the filename or fallback
            const parts = pathname.split("_");
            const lastModified = parts.length > 1 ? Number(parts[0]) : now;

            const fileAge = now - lastModified;

            console.log(`Checking file: ${pathname}, age: ${fileAge}ms`);

            if (fileAge > ONE_HOUR) {
                console.log(`Deleting file: ${pathname}`);
                await del(pathname);
                deletedFiles.push(pathname);
            }
        }

        console.log("Cleanup completed successfully. Deleted files:", deletedFiles);
        return NextResponse.json({
            message: "Cleanup complete",
            deletedFiles,
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error during cleanup:", error.message);
            return NextResponse.json(
                {
                    error: "Failed to clean up files",
                    details: error.message,
                },
                { status: 500 }
            );
        }
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
