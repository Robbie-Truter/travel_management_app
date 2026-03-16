import {
  IdCard,
  CreditCard,
  Plane,
  Hotel,
  Bus,
  ShieldCheck,
  FileBadge,
  FileQuestion,
} from "lucide-react";

export const DOCUMENT_TYPES = [
  { value: "id", label: "ID/Identification", icon: IdCard },
  { value: "passport", label: "Passport", icon: CreditCard },
  { value: "flight", label: "Flight Confirmation", icon: Plane },
  { value: "accommodation", label: "Accomodation Booking", icon: Hotel },
  { value: "transport", label: "Transport Tickets", icon: Bus },
  { value: "insurance", label: "Travel Insurance", icon: ShieldCheck },
  { value: "visa", label: "Visas", icon: FileBadge },
  { value: "other", label: "Other", icon: FileQuestion },
];
