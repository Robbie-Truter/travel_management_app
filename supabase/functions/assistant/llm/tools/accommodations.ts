import type { ToolDefinition } from "./types.ts";
import { buildAccommodationsContext } from "../../context/accommodations.ts";
import {
    deleteAccommodation,
    getAccommodations,
    insertAccommodation,
    updateAccommodation,
} from "../../services/accommodations.ts";

// Function definitions for gemini
export const accommodationsRegistry: Record<string, ToolDefinition> = {
    get_accommodations: {
        declaration: {
            name: "get_accommodations",
            description:
                "Returns the accommodations for the currently selected trip(s).",
        },

        execute: async ({ supabase, tripIds }) => {
            const accommodations = await getAccommodations(supabase, tripIds);
            return buildAccommodationsContext(accommodations);
        },
    },

    insert_accommodation: {
        declaration: {
            name: "insert_accommodation",
            description:
                "Adds an accommodation to the currently selected trip. " +
                "Before calling this you must have: " +
                "(1) called get_trip_countries to get the trip_country_id for the relevant country, " +
                "(2) called get_destinations to get the destination_id for the relevant destination (if applicable). " +
                "Only one trip may be active when calling this tool.",
            parameters: {
                type: "OBJECT",
                properties: {
                    trip_country_id: {
                        type: "NUMBER",
                        description:
                            "The trip_countries ID this accommodation belongs to (from get_trip_countries). Optional but recommended.",
                    },
                    destination_id: {
                        type: "NUMBER",
                        description:
                            "The destination ID this accommodation is linked to (from get_destinations). Optional but recommended.",
                    },
                    name: {
                        type: "STRING",
                        description:
                            "The name of the accommodation (e.g. 'Hotel de Crillon', 'Tokyo AirBnB').",
                    },
                    type: {
                        type: "STRING",
                        description:
                            "Type of accommodation. One of: 'hotel', 'airbnb', 'hostel', 'resort', 'other'. Defaults to 'hotel'.",
                        enum: [
                            "hotel",
                            "apartment",
                            "hostel",
                            "guesthouse",
                            "resort",
                            "other",
                        ],
                    },
                    platform: {
                        type: "STRING",
                        description:
                            "Optional booking platform used (e.g. 'booking.com', 'airbnb', 'expedia').",
                        enum: [
                            "booking.com",
                            "airbnb",
                            "expedia",
                            "agoda",
                            "hotels.com",
                            "direct",
                            "other",
                        ],
                    },
                    location: {
                        type: "STRING",
                        description:
                            "Address or area of the accommodation (e.g. '10 Place de la Concorde, Paris').",
                    },
                    check_in: {
                        type: "STRING",
                        description:
                            "Check-in date in YYYY-MM-DD format (e.g. '2025-06-15').",
                    },
                    check_out: {
                        type: "STRING",
                        description:
                            "Check-out date in YYYY-MM-DD format (e.g. '2025-06-20').",
                    },
                    check_in_after: {
                        type: "STRING",
                        description:
                            "Optional earliest check-in time (e.g. '14:00').",
                    },
                    check_out_before: {
                        type: "STRING",
                        description:
                            "Optional latest check-out time (e.g. '11:00').",
                    },
                    price: {
                        type: "NUMBER",
                        description:
                            "Optional total price for the stay. Defaults to 0.",
                    },
                    currency: {
                        type: "STRING",
                        description:
                            "Currency code for the price (e.g. 'USD', 'EUR'). Defaults to 'USD'.",
                    },
                    booking_link: {
                        type: "STRING",
                        description:
                            "Optional URL for the booking confirmation.",
                    },
                    notes: {
                        type: "STRING",
                        description:
                            "Optional free-text notes about the accommodation.",
                    },
                    is_confirmed: {
                        type: "BOOLEAN",
                        description:
                            "Whether the booking is confirmed. Defaults to false.",
                    },
                },
                required: ["name", "location", "check_in", "check_out"],
            },
        },

        execute: async ({ supabase, tripIds, userId }, args) => {
            const tripId = tripIds[0];
            const tripCountryId = args["trip_country_id"] as
                | number
                | undefined;
            const destinationId = args["destination_id"] as number | undefined;
            const name = args["name"] as string;
            const type = (args["type"] as string | undefined) ?? "hotel";
            const platform = args["platform"] as string | undefined;
            const location = args["location"] as string;
            const checkIn = args["check_in"] as string;
            const checkOut = args["check_out"] as string;
            const checkInAfter = args["check_in_after"] as string | undefined;
            const checkOutBefore = args["check_out_before"] as
                | string
                | undefined;
            const price = args["price"] as number | undefined;
            const currency = args["currency"] as string | undefined;
            const bookingLink = args["booking_link"] as string | undefined;
            const notes = args["notes"] as string | undefined;
            const isConfirmed = args["is_confirmed"] as boolean | undefined;

            const inserted = await insertAccommodation(supabase, {
                tripId,
                userId,
                tripCountryId,
                destinationId,
                name,
                type,
                platform,
                location,
                checkIn,
                checkOut,
                checkInAfter,
                checkOutBefore,
                price,
                currency,
                bookingLink,
                notes,
                isConfirmed,
            });

            return (
                `Successfully added accommodation "${inserted.name}" ` +
                `(${inserted.type}) at "${inserted.location}" ` +
                `checking in ${inserted.check_in} → ${inserted.check_out} ` +
                `to trip ${tripId}. Accommodation ID: ${inserted.id}.`
            );
        },
    },

    delete_accommodation: {
        declaration: {
            name: "delete_accommodation",
            description:
                "Removes an accommodation from the currently selected trip. " +
                "Call get_accommodations first to confirm the correct accommodation_id before deleting. " +
                "This action is irreversible.",
            parameters: {
                type: "OBJECT",
                properties: {
                    accommodation_id: {
                        type: "NUMBER",
                        description:
                            "The accommodation ID to delete (from get_accommodations).",
                    },
                },
                required: ["accommodation_id"],
            },
        },

        execute: async ({ supabase, tripIds }, args) => {
            const tripId = tripIds[0];
            const accommodationId = args["accommodation_id"] as number;

            const deleted = await deleteAccommodation(
                supabase,
                accommodationId,
            );

            return (
                `Successfully removed accommodation "${deleted.name}" ` +
                `(accommodation_id: ${deleted.id}, trip_id: ${deleted.trip_id}) ` +
                `from trip ${tripId}.`
            );
        },
    },

    update_accommodation: {
        declaration: {
            name: "update_accommodation",
            description:
                "Updates one or more fields on an existing accommodation in the currently selected trip. " +
                "Only the fields you provide will be changed; omitted fields are left as-is. " +
                "Call get_accommodations first to confirm the correct accommodation_id. " +
                "This action is irreversible.",
            parameters: {
                type: "OBJECT",
                properties: {
                    accommodation_id: {
                        type: "NUMBER",
                        description:
                            "The accommodation ID to update (from get_accommodations).",
                    },
                    trip_country_id: {
                        type: "NUMBER",
                        description:
                            "Updated trip_countries ID this accommodation belongs to (from get_trip_countries).",
                    },
                    destination_id: {
                        type: "NUMBER",
                        description:
                            "Updated destination ID this accommodation is linked to (from get_destinations).",
                    },
                    name: {
                        type: "STRING",
                        description: "Updated name of the accommodation.",
                    },
                    type: {
                        type: "STRING",
                        description: "Updated type of accommodation.",
                        enum: [
                            "hotel",
                            "airbnb",
                            "hostel",
                            "resort",
                            "other",
                        ],
                    },
                    platform: {
                        type: "STRING",
                        description: "Updated booking platform used.",
                        enum: [
                            "booking.com",
                            "airbnb",
                            "expedia",
                            "agoda",
                            "hotels.com",
                            "direct",
                            "other",
                        ],
                    },
                    location: {
                        type: "STRING",
                        description:
                            "Updated address or area of the accommodation.",
                    },
                    check_in: {
                        type: "STRING",
                        description:
                            "Updated check-in date in YYYY-MM-DD format.",
                    },
                    check_out: {
                        type: "STRING",
                        description:
                            "Updated check-out date in YYYY-MM-DD format.",
                    },
                    check_in_after: {
                        type: "STRING",
                        description:
                            "Updated optional earliest check-in time (e.g. '14:00').",
                    },
                    check_out_before: {
                        type: "STRING",
                        description:
                            "Updated optional latest check-out time (e.g. '11:00').",
                    },
                    price: {
                        type: "NUMBER",
                        description: "Updated total price for the stay.",
                    },
                    currency: {
                        type: "STRING",
                        description:
                            "Updated currency code (e.g. 'USD', 'EUR').",
                    },
                    booking_link: {
                        type: "STRING",
                        description:
                            "Updated URL for the booking confirmation.",
                    },
                    notes: {
                        type: "STRING",
                        description:
                            "Updated free-text notes about the accommodation.",
                    },
                    is_confirmed: {
                        type: "BOOLEAN",
                        description:
                            "Updated whether the booking is confirmed.",
                    },
                },
                required: ["accommodation_id"],
            },
        },

        execute: async ({ supabase, tripIds }, args) => {
            const tripId = tripIds[0];
            const accommodationId = args["accommodation_id"] as number;
            const tripCountryId = args["trip_country_id"] as number | undefined;
            const destinationId = args["destination_id"] as number | undefined;
            const name = args["name"] as string | undefined;
            const type = args["type"] as
                | "hotel"
                | "airbnb"
                | "hostel"
                | "resort"
                | "other"
                | undefined;
            const platform = args["platform"] as
                | "booking.com"
                | "airbnb"
                | "expedia"
                | "agoda"
                | "hotels.com"
                | "direct"
                | "other"
                | undefined;
            const location = args["location"] as string | undefined;
            const checkIn = args["check_in"] as string | undefined;
            const checkOut = args["check_out"] as string | undefined;
            const checkInAfter = args["check_in_after"] as string | undefined;
            const checkOutBefore = args["check_out_before"] as
                | string
                | undefined;
            const price = args["price"] as number | undefined;
            const currency = args["currency"] as string | undefined;
            const bookingLink = args["booking_link"] as string | undefined;
            const notes = args["notes"] as string | undefined;
            const isConfirmed = args["is_confirmed"] as boolean | undefined;

            const updated = await updateAccommodation(supabase, {
                id: accommodationId,
                trip_country_id: tripCountryId,
                destination_id: destinationId,
                name,
                type,
                platform,
                location,
                check_in: checkIn,
                check_out: checkOut,
                check_in_after: checkInAfter,
                check_out_before: checkOutBefore,
                price,
                currency,
                booking_link: bookingLink,
                notes,
                is_confirmed: isConfirmed,
            });

            return (
                `Successfully updated accommodation "${updated.name}" ` +
                `(${updated.type}) at "${updated.location}" ` +
                `checking in ${updated.check_in} → ${updated.check_out} ` +
                `to trip ${tripId}. Accommodation ID: ${updated.id}.`
            );
        },
    },
};
