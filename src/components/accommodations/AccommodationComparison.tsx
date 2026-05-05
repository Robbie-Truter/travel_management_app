import { Modal } from "@/components/ui/Modal";
import { Image as ImageIcon } from "lucide-react";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import type { Accommodation, TripCountry } from "@/db/types";
import { PLATFORM_OPTIONS } from "./AccommodationConstants";

interface AccommodationComparisonProps {
  open: boolean;
  onClose: () => void;
  accommodations: Accommodation[];
  tripCountries?: TripCountry[];
}

export function AccommodationComparison({
  open,
  onClose,
  accommodations,
  tripCountries = [],
}: AccommodationComparisonProps) {
  return (
    <Modal open={open} onClose={onClose} title="Compare Accommodations" size="xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-text-muted font-medium">Field</th>
              {accommodations.map((a) => (
                <th key={a.id} className="text-left py-2 px-4 text-text-primary font-semibold">
                  {a.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              {
                label: "Image",
                render: (a: Accommodation) =>
                  a.image ? (
                    <img
                      src={a.image}
                      alt={a.name}
                      className="w-16 h-12 object-cover rounded shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-12 bg-surface-3 rounded flex items-center justify-center text-text-muted">
                      <ImageIcon size={16} />
                    </div>
                  ),
              },
              { label: "Type", render: (a: Accommodation) => a.type },
              {
                label: "Platform",
                render: (a: Accommodation) => {
                  const p = PLATFORM_OPTIONS.find((opt) => opt.value === a.platform);
                  if (!p) return a.platform ?? "—";
                  return (
                    <div className="flex items-center gap-2">
                      {p.icon}
                      <span>{p.label}</span>
                    </div>
                  );
                },
              },
              {
                label: "Country",
                render: (a: Accommodation) =>
                  tripCountries.find((tc) => tc.id === a.tripCountryId)?.countryName ?? "—",
              },
              { label: "Location", render: (a: Accommodation) => a.location },
              { label: "Check-in", render: (a: Accommodation) => formatDateTime(a.checkIn) },
              { label: "Check-in After", render: (a: Accommodation) => a.checkInAfter ?? "3 PM" },
              { label: "Check-out", render: (a: Accommodation) => formatDateTime(a.checkOut) },
              {
                label: "Check-out Before",
                render: (a: Accommodation) => a.checkOutBefore ?? "11 AM",
              },
              { label: "Price", render: (a: Accommodation) => formatCurrency(a.price, a.currency) },
              {
                label: "Status",
                render: (a: Accommodation) => (a.isConfirmed ? "✅ Confirmed" : "Option"),
              },
              { label: "Notes", render: (a: Accommodation) => a.notes ?? "—" },
            ].map((row) => (
              <tr key={row.label}>
                <td className="py-2.5 pr-4 text-text-muted font-medium">{row.label}</td>
                {accommodations.map((a) => (
                  <td key={a.id} className="py-2.5 px-4 text-text-primary">
                    {row.render(a)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
