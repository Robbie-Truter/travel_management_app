// Common Shared Types
export type TripStatus = "planning" | "booked" | "ongoing" | "completed" | "cancelled";
export type Currency = "USD" | "EUR" | "ZAR";

// --- City Lookup ---
export interface CityLookupRow {
  id: number;
  city: string;
  city_ascii: string;
  lat: number;
  lng: number;
  country: string;
  iso2: string;
  iso3: string;
  admin_name?: string;
  capital?: string;
}

// --- Country Lookup ---
export interface CountryLookupRow {
  id: number;
  name: string;
  demonym?: string;
  iso2: string;
  iso3?: string;
  tld?: string;
  currency?: string;
  calling_code?: string;
  language?: string;
  website?: string;
  continent?: string;
}

// --- Trips ---
export interface TripRow {
  id: number;
  user_id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: TripStatus;
  description?: string;
  budget?: string;
  cover_image?: string;
  created_at: string;
  updated_at: string;
  trip_countries?: TripCountryRow[];
}

export interface Trip {
  id?: number;
  name: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  description?: string;
  tripCountries?: TripCountry[];
  budget?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

// --- TripCountries ---
export interface TripCountryRow {
  id: number;
  trip_id: number;
  country_id: number;
  country_name: string;
  country_code: string;
  budget_limit?: number;
  notes?: string;
  order: number;
  created_at: string;
}

export interface TripCountry {
  id?: number;
  tripId: number;
  countryId: number;
  countryName: string;
  countryCode: string;
  budgetLimit?: number;
  notes?: string;
  order: number;
  createdAt: string;
}

// --- Destinations ---
export interface DestinationRow {
  id: number;
  trip_id: number;
  trip_country_id: number;
  country_id: number;
  city_lookup_id?: number;
  name: string;
  image?: string;
  notes?: string;
  order?: number;
  created_at: string;
}

export interface Destination {
  id?: number;
  tripId: number;
  tripCountryId: number;
  countryId: number;
  cityLookupId?: number;
  name: string;
  image?: string;
  notes?: string;
  order?: number;
  createdAt: string;
}

// --- Flights ---
export interface FlightSegment {
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  coordinates?: {
    departure?: [number, number];
    arrival?: [number, number];
  };
}

export interface FlightRow {
  id: number;
  user_id: string;
  trip_id: number;
  trip_country_id?: number;
  description?: string;
  segments: FlightSegment[];
  price: number;
  currency: Currency;
  booking_link?: string;
  notes?: string;
  is_confirmed: boolean;
  created_at: string;
}

export interface Flight {
  id?: number;
  tripId: number;
  tripCountryId?: number;
  description?: string;
  segments: FlightSegment[];
  price: number;
  currency: Currency;
  bookingLink?: string;
  notes?: string;
  isConfirmed: boolean;
  createdAt: string;
}

// --- Accommodations ---
export interface AccommodationRow {
  id: number;
  user_id: string;
  trip_id: number;
  trip_country_id?: number;
  destination_id?: number;
  name: string;
  type: "hotel" | "airbnb" | "hostel" | "resort" | "other";
  platform?: string;
  location: string;
  check_in: string;
  check_out: string;
  price: number;
  currency: Currency;
  booking_link?: string;
  notes?: string;
  image?: string;
  check_in_after?: string;
  check_out_before?: string;
  is_confirmed: boolean;
  created_at: string;
}

export interface Accommodation {
  id?: number;
  tripId: number;
  tripCountryId?: number;
  destinationId?: number;
  name: string;
  type: "hotel" | "airbnb" | "hostel" | "resort" | "other";
  platform?: string;
  location: string;
  checkIn: string;
  checkOut: string;
  price: number;
  currency: Currency;
  bookingLink?: string;
  notes?: string;
  image?: string;
  checkInAfter?: string;
  checkOutBefore?: string;
  isConfirmed: boolean;
  createdAt: string;
}

// --- Activities ---
export interface ActivityRow {
  id: number;
  user_id: string;
  trip_id: number;
  trip_country_id?: number;
  destination_id?: number;
  name: string;
  date: string;
  type?: string;
  link?: string;
  notes?: string;
  duration?: number;
  cost?: number;
  currency: Currency;
  is_confirmed: boolean;
  image?: string;
  order: number;
  created_at: string;
}

export interface Activity {
  id?: number;
  tripId: number;
  tripCountryId?: number;
  destinationId?: number;
  name: string;
  date: string;
  type?: string;
  link?: string;
  notes?: string;
  duration?: number;
  cost?: number;
  currency: Currency;
  isConfirmed: boolean;
  image?: string;
  order: number;
  createdAt: string;
}

// --- Notes ---
export interface NoteRow {
  id: number;
  user_id: string;
  trip_id: number;
  content: string;
  updated_at: string;
}

export interface Note {
  id?: number;
  tripId: number;
  content: string;
  updatedAt: string;
}

// --- Documents ---
export interface DocumentRow {
  id: number;
  user_id: string;
  trip_id: number;
  name: string;
  description?: string;
  type: string;
  file: string;
  created_at: string;
}

export interface Document {
  id?: number;
  tripId: number;
  name: string;
  description?: string;
  type: string;
  file: string;
  createdAt: string;
}

// --- Helper Types ---
export interface PlannerItem {
  id: string;
  type: "flight" | "accommodation" | "activity";
  date: string;
  data: Flight | Accommodation | Activity;
}
