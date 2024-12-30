import { put, del, list } from "@vercel/blob"; // Correct imports

const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

function sanitizeKey(key: string): string {
    return encodeURIComponent(key); // Encode the key to make it URL-safe
}

async function setCache(key: string, data: any) {
    const sanitizedKey = sanitizeKey(key);
    const cacheEntry = {
        data,
        expiry: Date.now() + CACHE_TTL,
    };

    // Store in Vercel Blob Storage
    await put(`cache/${sanitizedKey}`, JSON.stringify(cacheEntry), {
        contentType: "application/json",
        access: "public", // Specify access level
    });
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
            // Cache expired, delete it
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

// API Fetch Functions with Cache
async function get_commodities() {
    return await fetchWithCache("https://api.uexcorp.space/2.0/commodities");
}

async function get_commodity_prices(queryParams: Record<string, any> = {}) {
    return await fetchWithCache("https://api.uexcorp.space/2.0/commodities_prices", queryParams);
}


async function get_cities(queryParams: Record<string, any> = {}) {
    return await fetchWithCache("https://api.uexcorp.space/2.0/cities", queryParams);
}

async function get_terminals(queryParams: Record<string, any> = {}) {
    return await fetchWithCache("https://api.uexcorp.space/2.0/terminals", queryParams);
}

async function get_planets(queryParams: Record<string, any> = {}) {
    return await fetchWithCache("https://api.uexcorp.space/2.0/planets", queryParams);
}

async function get_moons(queryParams: Record<string, any> = {}) {
    return await fetchWithCache("https://api.uexcorp.space/2.0/moons", queryParams);
}

async function get_orbits(queryParams: Record<string, any> = {}) {
    return await fetchWithCache("https://api.uexcorp.space/2.0/orbits", queryParams);
}

async function get_space_stations(queryParams: Record<string, any> = {}) {
    return await fetchWithCache("https://api.uexcorp.space/2.0/space_stations", queryParams);
}

// Exported Function Runner
export async function runFunction(name: string, args: Record<string, any>) {
    switch (name) {
        case "get_commodities":
            return await get_commodities();
        case "get_commodity_prices":
            return await get_commodity_prices(args);
        case "get_cities":
            return await get_cities(args);
        case "get_terminals":
            return await get_terminals(args);
        case "get_planets":
            return await get_planets(args);
        case "get_moons":
            return await get_moons(args);
        case "get_orbits":
            return await get_orbits(args);
        case "get_space_stations":
            return await get_space_stations(args);
        default:
            throw new Error(`Function ${name} is not defined.`);
    }
}

// OpenAI Functions Array
export const functions = [
    {
        "name": "get_commodity_prices",
        "description": "Fetch prices for specific commodities based on various query parameters. Note that you MUST use at least one property is required. do not run this API without atleast 1 property. if you dont have it, check your knowledge base to compare the commodity provided to find its community code.",
        "parameters": {
            "type": "object",
            "properties": {
                "id_terminal": {
                    "type": "string",
                    "description": "Comma-separated terminal IDs (e.g., '1,2,3')."
                },
                "id_commodity": {
                    "type": "integer",
                    "description": "The ID of the commodity."
                },
                "terminal_name": {
                    "type": "string",
                    "description": "The name of the terminal."
                },
                "commodity_name": {
                    "type": "string",
                    "description": "The name of the commodity."
                },
                "terminal_code": {
                    "type": "string",
                    "description": "The code of the terminal."
                },
                "commodity_code": {
                    "type": "string",
                    "description": "The code of the commodity. PRIORITIZE USING THIS. All community codes are in your knowledge base within the blob file."
                }
            },
            "required": [] // No required properties in schema
        }
    },
    {
        name: "get_cities",
        description: "Fetch city data based on optional filters. Note that you MUST use at least one filter.",
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
        description: "Fetch terminal data based on optional filters. Note that you MUST use at least one filter.",
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
        description: "Fetch planet data based on optional filters. Note that you MUST use at least one filter.",
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
        description: "Fetch moon data based on optional filters. Note that you MUST use at least one filter.",
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
        description: "Fetch orbit data based on optional filters. Note that you MUST use at least one filter.",
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
        description: "Fetch space station data based on optional filters. Note that you MUST use at least one filter.",
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
