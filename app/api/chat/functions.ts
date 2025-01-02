// Import fetch for use
// import fetch from "node-fetch";

// Helper function for logging




async function fetchWithCache(endpoint: string, queryParams: Record<string, any> = {}): Promise<any> {



 
    // Fetch from API
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await fetch(`${endpoint}?${queryString}`);
    const data = await response.json();



    return data;
}












// API Fetch Functions with logging

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
    return await fetchWithCache("https://api.uexcorp.space/2.0/commodities_prices", queryParams);
}

async function get_cities(queryParams: Record<string, any> = {}) {
    return await fetchWithCache("https://api.uexcorp.space/2.0/cities", queryParams);
}

async function get_all_terminals() {
    return await fetchWithCache("https://api.uexcorp.space/2.0/terminals");
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

export async function runFunction(name: string, args: Record<string, any>) {
    console.log(`[LOG] Function called: ${name}`);
    console.log(`[LOG] Arguments:`, JSON.stringify(args, null, 2));

    try {
        // Find the function schema from tools
        const functionSchema = tools.find(tool => tool.name === name);

        if (!functionSchema) {
            throw new Error(`Function ${name} is not defined.`);
        }

        // Check if the function has parameters
        if (functionSchema.parameters) {
            const paramKeys = Object.keys(functionSchema.parameters.properties || {});

            // Enforce that at least one parameter is provided if the function has parameters
            if (paramKeys.length > 0 && Object.keys(args).length === 0) {
                throw new Error(`At least one parameter is required for function ${name}.`);
            }
        }

        let result;
        switch (name) {
            case "data_extract":
                console.log(`[LOG] Running data_extract`);
                result = await data_extract();
                break;
            case "get_commodities":
                console.log(`[LOG] Running get_commodities`);
                result = await get_commodities();
                break;
            case "get_commodity_prices":
                console.log(`[LOG] Running get_commodity_prices with args`);
                result = await get_commodity_prices(args);
                break;
            case "get_cities":
                console.log(`[LOG] Running get_cities with args`);
                result = await get_cities(args);
                break;
            case "get_terminals":
                console.log(`[LOG] Running get_terminals with args`);
                result = await get_terminals(args);
                break;
            case "get_all_terminals":
                console.log(`[LOG] Running get_all_terminals`);
                result = await get_all_terminals();
                break;
            case "get_planets":
                console.log(`[LOG] Running get_planets with args`);
                result = await get_planets(args);
                break;
            case "get_moons":
                console.log(`[LOG] Running get_moons with args`);
                result = await get_moons(args);
                break;
            case "get_orbits":
                console.log(`[LOG] Running get_orbits with args`);
                result = await get_orbits(args);
                break;
            case "get_space_stations":
                console.log(`[LOG] Running get_space_stations with args`);
                result = await get_space_stations(args);
                break;
            case "get_commodities_prices_all":
                console.log(`[LOG] Running get_commodities_prices_all`);
                result = await get_commodities_prices_all();
                break;
            case "get_commodities_raw_prices_all":
                console.log(`[LOG] Running get_commodities_raw_prices_all`);
                result = await get_commodities_raw_prices_all();
                break;
            default:
                console.error(`[ERROR] Function not defined: ${name}`);
                throw new Error(`Function ${name} is not defined.`);
        }

        console.log(`[LOG] Function ${name} executed successfully. Result:`, JSON.stringify(result, null, 2));
        return result;
    } catch (error) {
        console.error(`[ERROR] Error while executing function ${name}:`, error);
        throw error;
    }
}



export const tools = [
    {
        type: "function",
        name: "data_extract",
        description: "Obtain the top 30 commodities routes according to UEX. All values are estimated.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
            additionalProperties: false,
        },
    },
    {
        type: "function",
        name: "get_commodities",
        description: "Fetch a list of all commodities including specifics like legality and market price.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
            additionalProperties: false,
        },
    },
    {
        type: "function",
        name: "get_commodities_prices_all",
        description: "Fetch a list of all commodity prices and their terminal availability. USE AS A LAST RESORT.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
            additionalProperties: false,
        },
    },
    {
        type: "function",
        name: "get_commodities_raw_prices_all",
        description: "Fetch a list of all raw commodity prices and their terminal availability.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
            additionalProperties: false,
        },
    },
    {
        type: "function",
        name: "get_all_terminals",
        description: "Fetch a list of all terminal information to help plan trade routes or find locations to sell.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
            additionalProperties: false,
        },
    },
    {
        type: "function",
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
            additionalProperties: false,
        },
    },
    {
        type: "function",
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
            additionalProperties: false,
        },
    },
    {
        type: "function",
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
            additionalProperties: false,
        },
    },
    {
        type: "function",
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
            additionalProperties: false,
        },
    },
    {
        type: "function",
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
            additionalProperties: false,
        },
    },
    {
        type: "function",
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
            additionalProperties: false,
        },
    },
    {
        type: "function",
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
            additionalProperties: false,
        },
    },
];

