import { put, del, list } from "@vercel/blob";

const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

function sanitizeKey(key: string): string {
    return encodeURIComponent(key); // Encode the key to make it URL-safe
}

async function deleteOldFiles(prefix: string, maxAge: number) {
    try {
        const blobs = await list({ prefix });
        const folders = new Set(
            blobs.blobs.map((blob) => {
                const parts = blob.pathname.split("/");
                return parts.length > 1 ? `${parts[0]}/${parts[1]}` : null;
            })
        );

        const now = Date.now();
        const deletedFolders = [];

        for (const folder of folders) {
            if (!folder) continue;

            const match = folder.match(/cache\/(\d+)/);
            const folderTimestamp = match ? Number(match[1]) : NaN;

            if (isNaN(folderTimestamp)) continue;

            const folderAge = now - folderTimestamp;

            if (folderAge > maxAge) {
                const folderFiles = await list({ prefix: folder });
                for (const file of folderFiles.blobs) {
                    await del(file.pathname);
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
    const timestamp = Date.now();
    const folderName = `cache/${timestamp}`;

    const cacheEntry = {
        data,
        expiry: timestamp + CACHE_TTL,
    };

    await put(`${folderName}/${sanitizedKey}`, JSON.stringify(cacheEntry), {
        contentType: "application/json",
        access: "public",
    });

    await deleteOldFiles("cache/", CACHE_TTL);
}

async function getCache(key: string): Promise<any | null> {
    const sanitizedKey = sanitizeKey(key);

    const blobs = await list({ prefix: `cache/${sanitizedKey}` });
    const blob = blobs.blobs.find((b) => b.pathname === `cache/${sanitizedKey}`);

    if (blob) {
        const response = await fetch(blob.url);
        const content = await response.text();
        const cacheEntry = JSON.parse(content);

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

    const cachedData = await getCache(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    const queryString = new URLSearchParams(queryParams).toString();
    const response = await fetch(`${endpoint}?${queryString}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${endpoint}: ${response.statusText}`);
    }

    const data = await response.json();

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
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    return await response.text();
}

async function get_commodities_prices_all() {
    return await fetchWithCache("https://api.uexcorp.space/2.0/commodities_prices_all");
}

async function get_commodities_raw_prices_all() {
    return await fetchWithCache("https://api.uexcorp.space/2.0/commodities_raw_prices_all");
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

export async function runFunction(name: string, args: Record<string, any>, toolChoice?: string) {
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

export const functions: Array<any> = [
    {
        name: "data_extract",
        description: "Obtain the top 30 commodities routes according to UEX. All values are estimated.",
        type: "function",
        function: async () => await data_extract
    },
    {
        name: "get_commodities",
        description: "Fetch a list of all commodities including specifics like legality and market price.",
        type: "function",
        function: async () => await get_commodities(),
    },
    {
        name: "get_commodities_prices_all",
        description: "Fetch a list of all commodity prices and their terminal availability.",
        type: "function",
        function: async () => await get_commodities_prices_all
    },
    {
        name: "get_commodities_raw_prices_all",
        description: "Fetch a list of all raw commodity prices and their terminal availability.",
        type: "function",
        function: async () => await get_commodities_raw_prices_all
    },
    {
        name: "get_all_terminals",
        description: "Fetch a list of all terminal information.",
        type: "function",
        function: async () => await get_all_terminals
    },
    {
        name: "get_commodity_prices",
        description: "Fetch specific commodity prices using query parameters.",
        parameters: {
            type: "object",
            properties: {
                id_terminal: { type: "string", description: "Comma-separated terminal IDs." },
                id_commodity: { type: "integer", description: "Commodity ID." },
                terminal_name: { type: "string", description: "Terminal name." },
                commodity_name: { type: "string", description: "Commodity name." },
                terminal_code: { type: "string", description: "Terminal code." },
                commodity_code: { type: "string", description: "Commodity code." },
            },
            required: [],
        },
        type: "function",
        function: async (args: Record<string, any>) => await get_commodity_prices(args)
    },
    {
        name: "get_cities",
        description: "Fetch a list of cities with optional filters.",
        parameters: {
            type: "object",
            properties: {
                id_star_system: { type: "integer", description: "Star system ID." },
                id_planet: { type: "integer", description: "Planet ID." },
                id_orbit: { type: "integer", description: "Orbit ID." },
                id_moon: { type: "integer", description: "Moon ID." },
            },
            required: [],
        },
        type: "function",
        function: async (args: Record<string, any>) => await get_cities(args)
    },
    {
        name: "get_terminals",
        description: "Fetch terminals using query parameters.",
        parameters: {
            type: "object",
            properties: {
                id_star_system: { type: "integer", description: "Star system ID." },
                id_planet: { type: "integer", description: "Planet ID." },
                name: { type: "string", description: "Terminal name." },
            },
            required: [],
        },
        type: "function",
        function: async (args: Record<string, any>) => await get_terminals(args)
    },
    {
        name: "get_planets",
        description: "Fetch planets with optional filters.",
        parameters: {
            type: "object",
            properties: {
                id_star_system: { type: "integer", description: "Star system ID." },
                id_faction: { type: "integer", description: "Faction ID." },
                id_jurisdiction: { type: "integer", description: "Jurisdiction ID." },
                is_lagrange: { type: "integer", description: "Filter for Lagrange points." },
            },
            required: [],
        },
        type: "function",
        function: async (args: Record<string, any>) => await get_planets(args)
    },
    {
        name: "get_moons",
        description: "Fetch moons using query parameters.",
        parameters: {
            type: "object",
            properties: {
                id_star_system: { type: "integer", description: "Star system ID." },
                id_planet: { type: "integer", description: "Planet ID." },
                id_faction: { type: "integer", description: "Faction ID." },
                id_jurisdiction: { type: "integer", description: "Jurisdiction ID." },
            },
            required: [],
        },
        type: "function",
        function: async (args: Record<string, any>) => await get_moons(args)
    },
    {
        name: "get_orbits",
        description: "Fetch orbit data using query parameters.",
        parameters: {
            type: "object",
            properties: {
                id_star_system: { type: "integer", description: "Star system ID." },
                id_faction: { type: "integer", description: "Faction ID." },
                id_jurisdiction: { type: "integer", description: "Jurisdiction ID." },
                is_lagrange: { type: "integer", description: "Filter for Lagrange points." },
            },
            required: [],
        },
        type: "function",
        function: async (args: Record<string, any>) => await get_orbits(args)
    },
    {
        name: "get_space_stations",
        description: "Fetch space station data using query parameters.",
        parameters: {
            type: "object",
            properties: {
                id_star_system: { type: "integer", description: "Star system ID." },
                id_planet: { type: "integer", description: "Planet ID." },
                id_orbit: { type: "integer", description: "Orbit ID." },
                id_moon: { type: "integer", description: "Moon ID." },
                id_city: { type: "integer", description: "City ID." },
                id_faction: { type: "integer", description: "Faction ID." },
                id_jurisdiction: { type: "integer", description: "Jurisdiction ID." },
            },
            required: [],
        },
        type: "function",
        function: async (args: Record<string, any>) => await get_space_stations(args)
    }
];
