import { Phone, HelpCircle } from "lucide-react";

export const TYPE_OPTIONS = [
  { value: "hotel", label: "Hotel" },
  { value: "apartment", label: "Apartment" },
  { value: "hostel", label: "Hostel" },
  { value: "guesthouse", label: "Guesthouse" },
  { value: "resort", label: "Resort" },
  { value: "other", label: "Other" },
];

export const PLATFORM_OPTIONS = [
  {
    value: "booking",
    label: "Booking.com",
    icon: (
      <img
        src="https://www.google.com/s2/favicons?domain=booking.com&sz=32"
        className="w-4 h-4 rounded-sm"
        alt="Booking.com"
      />
    ),
  },
  {
    value: "airbnb",
    label: "Airbnb",
    icon: (
      <img
        src="https://www.google.com/s2/favicons?domain=airbnb.com&sz=32"
        className="w-4 h-4 rounded-sm"
        alt="Airbnb"
      />
    ),
  },
  {
    value: "expedia",
    label: "Expedia",
    icon: (
      <img
        src="https://www.google.com/s2/favicons?domain=expedia.com&sz=32"
        className="w-4 h-4 rounded-sm"
        alt="Expedia"
      />
    ),
  },
  {
    value: "agoda",
    label: "Agoda",
    icon: (
      <img
        src="https://www.google.com/s2/favicons?domain=agoda.com&sz=32"
        className="w-4 h-4 rounded-sm"
        alt="Agoda"
      />
    ),
  },
  {
    value: "hotels",
    label: "Hotels.com",
    icon: (
      <img
        src="https://www.google.com/s2/favicons?domain=hotels.com&sz=32"
        className="w-4 h-4 rounded-sm"
        alt="Hotels.com"
      />
    ),
  },
  { value: "direct", label: "Direct", icon: <Phone size={14} className="text-slate-400" /> },
  { value: "other", label: "Other", icon: <HelpCircle size={14} className="text-slate-400" /> },
];
