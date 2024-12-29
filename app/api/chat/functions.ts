import { CompletionCreateParams } from "openai/resources/chat/index";

export const functions: CompletionCreateParams.Function[] = [
    {
        name: "get_commodity_prices",
        description: "Fetch prices for specific commodities based on various query parameters. ote that you MUST use atleast one filter",
        parameters: {
            type: "object",
            properties: {
                id_terminal: {
                    type: "string",
                    description: "Comma-separated terminal IDs.",
                },
                id_commodity: {
                    type: "integer",
                    description: "Commodity ID.",
                },
                terminal_name: {
                    type: "string",
                    description: "Terminal name.",
                },
                commodity_name: {
                    type: "string",
                    description: "Commodity name.",
                },
            },
            required: [],
        },
    },
    {
        name: "get_cities",
        description: "Fetch city data based on optional filters. Note that you MUST use atleast one filter",
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
        description: "Fetch terminal data based on optional filters. ote that you MUST use atleast one filter",
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

async function get_commodities() {
    const response = await fetch("https://api.uexcorp.space/2.0/commodities");
    return await response.json();
}

async function get_commodity_prices(queryParams: Record<string, any> = {}) {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await fetch(`https://api.uexcorp.space/2.0/commodities_prices?${queryString}`);
    return await response.json();
}

async function get_cities(queryParams: Record<string, any> = {}) {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await fetch(`https://api.uexcorp.space/2.0/cities?${queryString}`);
    return await response.json();
}

async function get_terminals(queryParams: Record<string, any> = {}) {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await fetch(`https://api.uexcorp.space/2.0/terminals?${queryString}`);
    return await response.json();
}

async function get_planets(queryParams: Record<string, any> = {}) {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await fetch(`https://api.uexcorp.space/2.0/planets?${queryString}`);
    return await response.json();
}

async function get_moons(queryParams: Record<string, any> = {}) {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await fetch(`https://api.uexcorp.space/2.0/moons?${queryString}`);
    return await response.json();
}

async function get_orbits(queryParams: Record<string, any> = {}) {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await fetch(`https://api.uexcorp.space/2.0/orbits?${queryString}`);
    return await response.json();
}

async function get_space_stations(queryParams: Record<string, any> = {}) {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await fetch(`https://api.uexcorp.space/2.0/space_stations?${queryString}`);
    return await response.json();
}

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
