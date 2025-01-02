// Import fetch for use
// import fetch from "node-fetch";

// Helper function for logging
function log(message: string, data?: any) {
    console.log(`[LOG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}




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
    log("Running function:", name);
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
            log("Error: Function not defined.", name);
            throw new Error(`Function ${name} is not defined.`);
    }
}


export const tools: Array<any> = [
    {
        type: "function",
        function: {
            name: "data_extract",
            description: "Obtain the top 30 commodities routes according to UEX. All values are estimated.",
        },
    },
    {
        type: "function",
        function: {
            name: "get_commodities",
            description: "Fetch a list of all commodities including specifics like legality and market price.",
        },
    },
    {
        type: "function",
        function: {
            name: "get_commodities_prices_all",
            description: "Fetch a list of all commodity prices and their terminal availability.",
        },
    },
    {
        type: "function",
        function: {
            name: "get_commodities_raw_prices_all",
            description: "Fetch a list of all raw commodity prices and their terminal availability.",
        },
    },
    {
        type: "function",
        function: {
            name: "get_all_terminals",
            description: "Fetch a list of all terminal information.",
        },
    },
    {
        type: "function",
        function: {
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
        },
    },
    {
        type: "function",
        function: {
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
        },
    },
    {
        type: "function",
        function: {
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
        },
    },
    {
        type: "function",
        function: {
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
        },
    },
    {
        type: "function",
        function: {
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
        },
    },
    {
        type: "function",
        function: {
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
        },
    },
    {
        type: "function",
        function: {
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
        },
    }
];
