import { put, del, list } from "@vercel/blob"; // Correct imports

const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

function sanitizeKey(key: string): string {
    return encodeURIComponent(key); // Encode the key to make it URL-safe
}

async function deleteOldFiles(prefix: string, maxAge: number) {
    try {
        console.log(`Starting cleanup for folders in prefix: ${prefix}`);
        const blobs = await list({ prefix }); // Retrieves all blobs matching the prefix

        // Extract unique folder names from the listed blobs
        const folders = new Set(
            blobs.blobs.map((blob) => {
                const parts = blob.pathname.split("/");
                return parts.length > 1 ? `${parts[0]}/${parts[1]}` : null;
            })
        );

        const now = Date.now();
        const deletedFolders = [];

        for (const folder of folders) {
            if (!folder) continue; // Skip invalid entries

            console.log(`Checking folder: ${folder}`);

            const match = folder.match(/cache\/(\d+)/); // Matches "cache/<timestamp>"
            const folderTimestamp = match ? Number(match[1]) : NaN;

            if (isNaN(folderTimestamp)) {
                console.log(`Skipping non-timestamped folder: ${folder}`);
                continue;
            }

            const folderAge = now - folderTimestamp;

            if (folderAge > maxAge) {
                console.log(`Deleting old folder: ${folder}, age: ${folderAge}ms`);

                const folderFiles = await list({ prefix: folder });
                for (const file of folderFiles.blobs) {
                    console.log(`Deleting file: ${file.pathname}`);
                    await del(file.pathname); // Delete each file individually
                }

                deletedFolders.push(folder);
            }
        }

        console.log("Cleanup complete. Deleted folders:", deletedFolders);
    } catch (error) {
        console.error("Error during cleanup of old folders:", error);
    }
}

async function setCache(key: string, data: any) {
    const sanitizedKey = sanitizeKey(key);
    const timestamp = Date.now(); // Current timestamp
    const folderName = `cache/${timestamp}`; // Folder named after timestamp

    const cacheEntry = {
        data,
        expiry: timestamp + CACHE_TTL,
    };

    // Store the cache entry inside the timestamped folder
    await put(`${folderName}/${sanitizedKey}`, JSON.stringify(cacheEntry), {
        contentType: "application/json",
        access: "public", // Specify access level
    });

    console.log(`Cache entry stored in folder: ${folderName}`);

    // Cleanup old folders in the cache directory
    await deleteOldFiles("cache/", CACHE_TTL);
}

async function getCache(key: string): Promise<any | null> {
    const sanitizedKey = sanitizeKey(key);

    // List blobs with the matching prefix
    const blobs = await list({ prefix: `cache/${sanitizedKey}` });

    // Use `pathname` to match the blob
    const blob = blobs.blobs.find((b) => b.pathname === `cache/${sanitizedKey}`);

    if (blob) {
        const response = await fetch(blob.url); // Fetch blob content using `url`
        const content = await response.text();
        const cacheEntry = JSON.parse(content);

        // Check expiry
        if (Date.now() < cacheEntry.expiry) {
            return cacheEntry.data;
        } else {
            await del(`cache/${sanitizedKey}`);
        }
    }
    return null;
}

async function fetchWithCache(endpoint: string, queryParams: Record<string, any> = {}): Promise<any> {
    const cacheKey = `${endpoint}?${new URLSearchParams(queryParams).toString()}`;

    // Check cache first
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return cachedData;
    }

    // Fetch from API
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await fetch(`${endpoint}?${queryString}`);
    const data = await response.json();

    // Store in cache
    await setCache(cacheKey, data);
    return data;
}

function validateQueryParams(queryParams: Record<string, any>): void {
    if (!queryParams || Object.keys(queryParams).length === 0) {
        throw new Error("At least one query parameter is required.");
    }
}

// API Fetch Functions with Cache
async function data_extract() {
    const url = "https://api.uexcorp.space/2.0/data_extract?data=commodities_routes";
    console.log(`Fetching URL: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    // Fetch as plain text
    const text = await response.text();
    console.log("API Response (Raw Text):", text);

    return text; // Return raw text or process it further if needed
}

async function get_commodities_prices_all() {
    return await fetchWithCache("https://api.uexcorp.space/2.0/commodities_prices_all");
}

async function get_commodities_raw_prices_all() {
    return await fetchWithCache("	https://api.uexcorp.space/2.0/commodities_raw_prices_all");
}

async function get_commodities() {
    return await fetchWithCache("https://api.uexcorp.space/2.0/commodities");
}

async function get_commodity_prices(queryParams: Record<string, any> = {}) {
    validateQueryParams(queryParams);
    return await fetchWithCache("https://api.uexcorp.space/2.0/commodities_prices", queryParams);
}

async function get_cities(queryParams: Record<string, any> = {}) {
    validateQueryParams(queryParams);
    return await fetchWithCache("https://api.uexcorp.space/2.0/cities", queryParams);
}

async function get_all_terminals() {
    return await fetchWithCache("https://api.uexcorp.space/2.0/terminals?type=commodity");
}

async function get_terminals(queryParams: Record<string, any> = {}) {
    validateQueryParams(queryParams);
    return await fetchWithCache("https://api.uexcorp.space/2.0/terminals", queryParams);
}

async function get_planets(queryParams: Record<string, any> = {}) {
    validateQueryParams(queryParams);
    return await fetchWithCache("https://api.uexcorp.space/2.0/planets", queryParams);
}

async function get_moons(queryParams: Record<string, any> = {}) {
    validateQueryParams(queryParams);
    return await fetchWithCache("https://api.uexcorp.space/2.0/moons", queryParams);
}

async function get_orbits(queryParams: Record<string, any> = {}) {
    validateQueryParams(queryParams);
    return await fetchWithCache("https://api.uexcorp.space/2.0/orbits", queryParams);
}

async function get_space_stations(queryParams: Record<string, any> = {}) {
    validateQueryParams(queryParams);
    return await fetchWithCache("https://api.uexcorp.space/2.0/space_stations", queryParams);
}

// Exported Function Runner
export async function runFunction(name: string, args: Record<string, any>) {
    switch (name) {
        case "data_extract":
            return await data_extract();
        case "get_commodities":
            return await get_commodities();
        case "get_commodity_prices":
            return await get_commodity_prices(args);
        case "get_cities":
            return await get_cities(args);
        case "get_terminals":
            return await get_terminals(args);
        case "get_all_terminals":
            return await get_all_terminals();
        case "get_planets":
            return await get_planets(args);
        case "get_moons":
            return await get_moons(args);
        case "get_orbits":
            return await get_orbits(args);
        case "get_space_stations":
            return await get_space_stations(args);
        case "get_commodities_prices_all":
            return await get_commodities_prices_all();
        case "get_commodities_raw_prices_all":
            return await get_commodities_raw_prices_all();
        default:
            throw new Error(`Function ${name} is not defined.`);
    }
}

// OpenAI Functions Array
export const functions = [
    {
         name: "data_extract",
         description: "obtain the top 30 commodities routes according to UEX. make sure to add that all values are estimated when providing from this API",
    },
    {
         name: "get_commodities",
         description: "Fetch a list of all commodites. This api includes specifics about each commodity like if its buyable or sellable, if its illegal is it raw or refined and average market price.",
    },
    {
         name: "get_commodities_prices_all",
         description: "Fetch a list of all commodity prices, what terminal the commodity is avaliable at, commoditiy prices etc",
    },
    {
         name: "get_commodities_raw_prices_all",
         description: "Fetch a list of all raw commodity prices, what terminal the commodity is avaliable at, commoditiy prices etc",
    },
    {
        name: "get_all_terminals",
        description: "Fetch a list of all terminal information. It will show you information about each terminal in the game.",
   },
    {
         name: "get_commodity_prices",
         description: "This API requires ONE query parameter, you must provide atleast one of these.",
         parameters: {
            type: "object",
             properties: {
                 id_terminal: {
                     type: "string",
                     description: "Comma-separated terminal IDs (e.g., '1,2,3')."
                },
                 id_commodity: {
                     type: "integer",
                     description: "The ID of the commodity."
                },
                 terminal_name: {
                     type: "string",
                     description: "The name of the terminal."
                },
                 commodity_name: {
                     type: "string",
                     description: "The name of the commodity."
                },
                 terminal_code: {
                     type: "string",
                     description: "The code of the terminal."
                },
                 commodity_code: {
                     type: "string",
                     description: "The code of the commodity. PRIORITIZE USING THIS. All commodity codes are in your knowledge base."
                }
            },
             required: [] // No required properties in schema
        }
    },
    {
        name: "get_cities",
        description: "This API can be run with no paramaters or with ONE parameter. provides a list of cities.",
        parameters: {
            type: "object",
            properties: {
                id_star_system: {
                    type: "integer",
                    description: "Star system ID.",
                },
                id_planet: {
                    type: "integer",
                    description: "Planet ID.",
                },
                id_orbit: {
                    type: "integer",
                    description: "Orbit ID.",
                },
                id_moon: {
                    type: "integer",
                    description: "Moon ID.",
                },
            },
            required: [],
        },
    },
    {
        name: "get_terminals",
        description: "This API requires ONE query parameter, you must provide atleast one of these.",
        parameters: {
            type: "object",
            properties: {
                id_star_system: {
                    type: "integer",
                    description: "Star system ID.",
                },
                id_planet: {
                    type: "integer",
                    description: "Planet ID.",
                },
                name: {
                    type: "string",
                    description: "Terminal name.",
                },
            },
            required: [],
        },
    },
    {
        name: "get_planets",
        description: "This API requires ONE query parameter, you must provide atleast one of these. can search specific information about a planet.",
        parameters: {
            type: "object",
            properties: {
                id_star_system: {
                    type: "integer",
                    description: "Star system ID.",
                },
                id_faction: {
                    type: "integer",
                    description: "Faction ID.",
                },
                id_jurisdiction: {
                    type: "integer",
                    description: "Jurisdiction ID.",
                },
                is_lagrange: {
                    type: "integer",
                    description: "Filter for Lagrange points.",
                },
            },
            required: [],
        },
    },
    {
        name: "get_moons",
        description: "This API requires ONE query parameter, you must provide atleast one of these.",
        parameters: {
            type: "object",
            properties: {
                id_star_system: {
                    type: "integer",
                    description: "Star system ID.",
                },
                id_planet: {
                    type: "integer",
                    description: "Planet ID.",
                },
                id_faction: {
                    type: "integer",
                    description: "Faction ID.",
                },
                id_jurisdiction: {
                    type: "integer",
                    description: "Jurisdiction ID.",
                },
            },
            required: [],
        },
    },
    {
        name: "get_orbits",
        description: "This API requires ONE query parameter, you must provide atleast one of these..",
        parameters: {
            type: "object",
            properties: {
                id_star_system: {
                    type: "integer",
                    description: "Star system ID.",
                },
                id_faction: {
                    type: "integer",
                    description: "Faction ID.",
                },
                id_jurisdiction: {
                    type: "integer",
                    description: "Jurisdiction ID.",
                },
                is_lagrange: {
                    type: "integer",
                    description: "Filter for Lagrange points.",
                },
            },
            required: [],
        },
    },
    {
        name: "get_space_stations",
        description: "This API requires ONE query parameter, you must provide atleast one of these.",
        parameters: {
            type: "object",
            properties: {
                id_star_system: {
                    type: "integer",
                    description: "Star system ID.",
                },
                id_planet: {
                    type: "integer",
                    description: "Planet ID.",
                },
                id_orbit: {
                    type: "integer",
                    description: "Orbit ID.",
                },
                id_moon: {
                    type: "integer",
                    description: "Moon ID.",
                },
                id_city: {
                    type: "integer",
                    description: "City ID.",
                },
                id_faction: {
                    type: "integer",
                    description: "Faction ID.",
                },
                id_jurisdiction: {
                    type: "integer",
                    description: "Jurisdiction ID.",
                },
            },
            required: [],
        },
    },
];
