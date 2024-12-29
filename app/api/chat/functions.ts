import { CompletionCreateParams } from "openai/resources/chat/index";

export const functions: CompletionCreateParams.Function[] = [
    {
        name: "get_commodities",
        description: "Fetch a list of commodities available in the UEX database.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },
    {
        name: "get_commodity_prices",
        description: "Fetch prices for specific commodities based on various query parameters.",
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
        description: "Fetch city data based on optional filters.",
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
        description: "Fetch terminal data based on optional filters.",
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
        default:
            throw new Error(`Function ${name} is not defined.`);
    }
}
