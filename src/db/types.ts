export type TripStatus = "planning" | "booked" | "ongoing" | "completed" | "cancelled";
export type Currency = "USD" | "EUR" | "ZAR";

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

export interface TripCountry {
  id?: number;
  tripId: number;
  countryName: string;
  countryCode: string;
  budgetLimit?: number;
  notes?: string;
  order: number;
  createdAt: string;
}

export interface Destination {
  id?: number;
  tripId: number;
  tripCountryId: number;
  name: string;
  image?: string;
  notes?: string;
  order?: number;
  createdAt: string;
}

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

export interface Accommodation {
  id?: number;
  tripId: number;
  tripCountryId?: number;
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

export interface Note {
  id?: number;
  tripId: number;
  content: string;
  updatedAt: string;
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

export interface PlannerItem {
  id: string;
  type: "flight" | "accommodation" | "activity";
  date: string;
  data: Flight | Accommodation | Activity;
}
