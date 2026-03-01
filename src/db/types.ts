export type TripStatus = "planning" | "booked" | "ongoing" | "completed" | "cancelled";
export type Currency = "USD" | "EUR" | "ZAR";

export interface Trip {
  id?: number;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  description?: string;
  budget?: string;
  coverImage?: string; // base64 encoded image
  createdAt: string;
  updatedAt: string;
}

export interface FlightStop {
  airport: string;
  duration: number; // minutes
}

export interface Flight {
  id?: number;
  tripId: number;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: Currency;
  stops?: FlightStop[];
  bookingLink?: string;
  notes?: string;
  isConfirmed: boolean;
  createdAt: string;
}

export interface Accommodation {
  id?: number;
  tripId: number;
  name: string;
  type: "hotel" | "airbnb" | "hostel" | "resort" | "other";
  location: string;
  checkIn: string;
  checkOut: string;
  price: number;
  currency: Currency;
  bookingLink?: string;
  notes?: string;
  isConfirmed: boolean;
  createdAt: string;
}

export interface Activity {
  id?: number;
  tripId: number;
  date: string;
  link?: string;
  notes?: string;
  duration?: number; // minutes
  cost?: number;
  name: string;
  currency: Currency;
  isConfirmed: boolean;
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
