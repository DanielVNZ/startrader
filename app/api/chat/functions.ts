// Import fetch for use
// import fetch from "node-fetch";

// Helper function for logging
function log(message: string, data?: any) {
    console.log(`[LOG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

function validateQueryParams(queryParams: Record<string, any>): void {
    if (!queryParams || Object.keys(queryParams).length === 0) {
        log("Error: No query parameters provided.");
        throw new Error("At least one query parameter is required.");
    }
    log("Validated query parameters.", queryParams);
}

// API Fetch Functions with logging

async function data_extract() {
    log("Calling data_extract...");
    const url = "https://api.uexcorp.space/2.0/data_extract?data=commodities_routes";
    try {
        const response = await fetch(url);
        log("Received response for data_extract:", response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const result = await response.text();
        log("data_extract response text:", result);
        return result;
    } catch (error) {
        log("Error in data_extract:", error);
        throw error;
    }
}

async function get_commodities_prices_all() {
    log("Calling get_commodities_prices_all...");
    try {
        const response = await fetch("https://api.uexcorp.space/2.0/commodities_prices_all");
        log("Received response for get_commodities_prices_all:", response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from API: ${response.statusText}`);
        }

        const result = await response.json();
        log("get_commodities_prices_all response JSON:", result);
        return result;
    } catch (error) {
        log("Error in get_commodities_prices_all:", error);
        throw error;
    }
}

async function get_commodities_raw_prices_all() {
    log("Calling get_commodities_raw_prices_all...");
    try {
        const response = await fetch("https://api.uexcorp.space/2.0/commodities_raw_prices_all");
        log("Received response for get_commodities_raw_prices_all:", response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from API: ${response.statusText}`);
        }

        const result = await response.json();
        log("get_commodities_raw_prices_all response JSON:", result);
        return result;
    } catch (error) {
        log("Error in get_commodities_raw_prices_all:", error);
        throw error;
    }
}

async function get_commodities() {
    log("Calling get_commodities...");
    try {
        const response = await fetch("https://api.uexcorp.space/2.0/commodities");
        log("Received response for get_commodities:", response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from API: ${response.statusText}`);
        }

        const result = await response.json();
        log("get_commodities response JSON:", result);
        return result;
    } catch (error) {
        log("Error in get_commodities:", error);
        throw error;
    }
}

async function get_commodity_prices(queryParams: Record<string, any> = {}) {
    log("Calling get_commodity_prices with query parameters:", queryParams);
    validateQueryParams(queryParams);
    const queryString = new URLSearchParams(queryParams).toString();
    try {
        const response = await fetch(`https://api.uexcorp.space/2.0/commodities_prices?${queryString}`);
        log("Received response for get_commodity_prices:", response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from API: ${response.statusText}`);
        }

        const result = await response.json();
        log("get_commodity_prices response JSON:", result);
        return result;
    } catch (error) {
        log("Error in get_commodity_prices:", error);
        throw error;
    }
}

async function get_cities(queryParams: Record<string, any> = {}) {
    log("Calling get_cities with query parameters:", queryParams);
    validateQueryParams(queryParams);
    const queryString = new URLSearchParams(queryParams).toString();
    try {
        const response = await fetch(`https://api.uexcorp.space/2.0/cities?${queryString}`);
        log("Received response for get_cities:", response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from API: ${response.statusText}`);
        }

        const result = await response.json();
        log("get_cities response JSON:", result);
        return result;
    } catch (error) {
        log("Error in get_cities:", error);
        throw error;
    }
}

async function get_all_terminals() {
    log("Calling get_all_terminals...");
    try {
        const response = await fetch("https://api.uexcorp.space/2.0/terminals?type=commodity");
        log("Received response for get_all_terminals:", response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from API: ${response.statusText}`);
        }

        const result = await response.json();
        log("get_all_terminals response JSON:", result);
        return result;
    } catch (error) {
        log("Error in get_all_terminals:", error);
        throw error;
    }
}

async function get_terminals(queryParams: Record<string, any> = {}) {
    log("Calling get_terminals with query parameters:", queryParams);
    validateQueryParams(queryParams);
    const queryString = new URLSearchParams(queryParams).toString();
    try {
        const response = await fetch(`https://api.uexcorp.space/2.0/terminals?${queryString}`);
        log("Received response for get_terminals:", response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from API: ${response.statusText}`);
        }

        const result = await response.json();
        log("get_terminals response JSON:", result);
        return result;
    } catch (error) {
        log("Error in get_terminals:", error);
        throw error;
    }
}

async function get_planets(queryParams: Record<string, any> = {}) {
    log("Calling get_planets with query parameters:", queryParams);
    validateQueryParams(queryParams);
    const queryString = new URLSearchParams(queryParams).toString();
    try {
        const response = await fetch(`https://api.uexcorp.space/2.0/planets?${queryString}`);
        log("Received response for get_planets:", response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from API: ${response.statusText}`);
        }

        const result = await response.json();
        log("get_planets response JSON:", result);
        return result;
    } catch (error) {
        log("Error in get_planets:", error);
        throw error;
    }
}

async function get_moons(queryParams: Record<string, any> = {}) {
    log("Calling get_moons with query parameters:", queryParams);
    validateQueryParams(queryParams);
    const queryString = new URLSearchParams(queryParams).toString();
    try {
        const response = await fetch(`https://api.uexcorp.space/2.0/moons?${queryString}`);
        log("Received response for get_moons:", response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from API: ${response.statusText}`);
        }

        const result = await response.json();
        log("get_moons response JSON:", result);
        return result;
    } catch (error) {
        log("Error in get_moons:", error);
        throw error;
    }
}

async function get_orbits(queryParams: Record<string, any> = {}) {
    log("Calling get_orbits with query parameters:", queryParams);
    validateQueryParams(queryParams);
    const queryString = new URLSearchParams(queryParams).toString();
    try {
        const response = await fetch(`https://api.uexcorp.space/2.0/orbits?${queryString}`);
        log("Received response for get_orbits:", response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from API: ${response.statusText}`);
        }

        const result = await response.json();
        log("get_orbits response JSON:", result);
        return result;
    } catch (error) {
        log("Error in get_orbits:", error);
        throw error;
    }
}

async function get_space_stations(queryParams: Record<string, any> = {}) {
    log("Calling get_space_stations with query parameters:", queryParams);
    validateQueryParams(queryParams);
    const queryString = new URLSearchParams(queryParams).toString();
    try {
        const response = await fetch(`https://api.uexcorp.space/2.0/space_stations?${queryString}`);
        log("Received response for get_space_stations:", response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from API: ${response.statusText}`);
        }

        const result = await response.json();
        log("get_space_stations response JSON:", result);
        return result;
    } catch (error) {
        log("Error in get_space_stations:", error);
        throw error;
    }
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
                required: ["id_terminal"],
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
