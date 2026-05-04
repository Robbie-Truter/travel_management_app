import { Modal } from "@/components/ui/Modal";
import { formatDateTime, formatCurrency, calculateDuration } from "@/lib/utils";
import type { Flight } from "@/db/types";

interface FlightComparisonProps {
  open: boolean;
  onClose: () => void;
  flights: Flight[];
}

export function FlightComparison({ open, onClose, flights }: FlightComparisonProps) {
  return (
    <Modal open={open} onClose={onClose} title="Compare Flights" size="xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-text-muted font-medium">Field</th>
              {flights.map((f) => {
                const firstSeg = f.segments[0];
                return (
                  <th key={f.id} className="text-left py-2 px-4 text-text-primary font-semibold">
                    {firstSeg.airline} {firstSeg.flightNumber}
                    {f.segments.length > 1 && (
                      <span className="block text-[10px] text-text-muted font-normal mt-0.5">
                        +{f.segments.length - 1} more legs
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              {
                label: "Description",
                render: (f: Flight) => f.description ?? "—",
              },
              {
                label: "Route",
                render: (f: Flight) => {
                  const first = f.segments[0];
                  const last = f.segments[f.segments.length - 1];
                  return `${first.departureAirport} → ${last.arrivalAirport}`;
                },
              },
              {
                label: "Departure",
                render: (f: Flight) => formatDateTime(f.segments[0].departureTime),
              },
              {
                label: "Arrival",
                render: (f: Flight) =>
                  formatDateTime(f.segments[f.segments.length - 1].arrivalTime),
              },
              { label: "Price", render: (f: Flight) => formatCurrency(f.price, f.currency) },
              {
                label: "Layovers",
                render: (f: Flight) =>
                  f.segments.length > 1
                    ? f.segments
                        .slice(0, -1)
                        .map(
                          (s, i) =>
                            `${s.arrivalAirport} (${calculateDuration(s.arrivalTime, f.segments[i + 1].departureTime)})`,
                        )
                        .join(", ")
                    : "Direct",
              },
              {
                label: "Status",
                render: (f: Flight) => (f.isConfirmed ? "✅ Confirmed" : "Option"),
              },
              { label: "Notes", render: (f: Flight) => f.notes ?? "—" },
            ].map((row) => (
              <tr key={row.label}>
                <td className="py-2.5 pr-4 text-text-muted font-medium">{row.label}</td>
                {flights.map((f) => (
                  <td key={f.id} className="py-2.5 px-4 text-text-primary">
                    {row.render(f)}
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
