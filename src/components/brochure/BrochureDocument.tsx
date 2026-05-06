import { Document, Page, Text, View, StyleSheet, Font, Image, Link } from "@react-pdf/renderer";
import type {
  Trip,
  Flight,
  Accommodation,
  Activity,
  Destination,
  Document as Doc,
  Note,
} from "@/db/types";
import { calculateDuration, getTimezoneAbbr } from "@/lib/utils";

// Register fonts
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf",
      fontWeight: 700,
    },
  ],
});

// Vibrant and professional palette
const colors = {
  primary: "#6366f1", // indigo-500
  secondary: "#0ea5e9", // sky-500
  accent: "#f43f5e", // rose-500
  success: "#10b981", // emerald-500
  warning: "#f59e0b", // amber-500
  textPrimary: "#0f172a", // slate-900
  textSecondary: "#475569", // slate-600
  textMuted: "#94a3b8", // slate-400
  surface: "#f8fafc", // slate-50
  surfaceDark: "#f1f5f9", // slate-100
  border: "#e2e8f0", // slate-200
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    padding: 40,
    backgroundColor: colors.white,
    color: colors.textPrimary,
  },
  // Cover Page
  coverPage: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    padding: 40,
  },
  coverImage: {
    width: "100%",
    height: 350,
    objectFit: "cover",
    borderRadius: 20,
    marginBottom: 40,
  },
  coverTitle: {
    fontSize: 48,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: -1,
  },
  coverSubtitle: {
    fontSize: 20,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: "center",
    maxWidth: "80%",
  },
  coverInfo: {
    flexDirection: "row",
    gap: 20,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  coverInfoItem: {
    alignItems: "center",
  },
  coverInfoLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 4,
  },
  coverInfoValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
  },

  // Layout Elements
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 8,
  },
  subSectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 12,
  },
  countryBanner: {
    backgroundColor: colors.surfaceDark,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  countryName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  countryMeta: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: "bold",
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
    maxWidth: "75%",
  },
  badge: {
    fontSize: 8,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    textTransform: "uppercase",
  },
  statusBadgeConfirmed: {
    backgroundColor: "#dcfce7",
    color: colors.success,
  },
  statusBadgePlanning: {
    backgroundColor: "#fef3c7",
    color: colors.warning,
  },

  // Typography
  text: {
    fontSize: 11,
    lineHeight: 1.5,
    color: colors.textPrimary,
  },
  textSecondary: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  price: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 5,
  },
  link: {
    fontSize: 10,
    color: colors.secondary,
    textDecoration: "underline",
    marginTop: 5,
  },

  // Specific Components
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridItem: {
    width: "48%",
  },
  image: {
    width: "100%",
    height: 120,
    objectFit: "cover",
    borderRadius: 6,
    marginTop: 10,
  },
  segment: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderTopStyle: "dashed",
  },
  timelineItem: {
    marginLeft: 15,
    paddingLeft: 15,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    paddingBottom: 20,
  },
  timelineDot: {
    position: "absolute",
    left: -6,
    top: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  noteBox: {
    backgroundColor: "#fff7ed",
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    padding: 15,
    borderRadius: 4,
    marginTop: 10,
  },
  docIcon: {
    width: 32,
    height: 32,
    backgroundColor: colors.surfaceDark,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
});

interface BrochureDocumentProps {
  trip: Trip;
  flights: Flight[];
  accommodations: Accommodation[];
  activities: Activity[];
  destinations: Destination[];
  documents: Doc[];
  notes: Note[];
}

export function BrochureDocument({
  trip,
  flights,
  accommodations,
  activities,
  destinations,
  documents,
  notes,
}: BrochureDocumentProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string, timeZone?: string) => {
    try {
      const time = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: timeZone || "UTC",
      }).format(new Date(timeStr));

      const abbr = getTimezoneAbbr(timeStr, timeZone);
      return `${time} ${abbr}`;
    } catch {
      return new Date(timeStr).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getStatusBadge = (isConfirmed: boolean) => (
    <View
      style={[styles.badge, isConfirmed ? styles.statusBadgeConfirmed : styles.statusBadgePlanning]}
    >
      <Text>{isConfirmed ? "Confirmed" : "Planning"}</Text>
    </View>
  );

  return (
    <Document>
      {/* 1. Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          {trip.coverImage ? (
            <Image src={trip.coverImage} style={styles.coverImage} />
          ) : (
            <View
              style={[
                styles.coverImage,
                {
                  backgroundColor: colors.surfaceDark,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Text style={{ color: colors.textMuted }}>Wanderplan</Text>
            </View>
          )}
          <Text style={styles.coverTitle}>{trip.name}</Text>
          <Text style={styles.coverSubtitle}>
            {trip.tripCountries?.map((tc) => tc.countryName).join(" • ") || "Exploring the World"}
          </Text>

          <View style={styles.coverInfo}>
            <View style={styles.coverInfoItem}>
              <Text style={styles.coverInfoLabel}>Departure</Text>
              <Text style={styles.coverInfoValue}>{formatDate(trip.startDate)}</Text>
            </View>
            <View style={styles.coverInfoItem}>
              <Text style={styles.coverInfoLabel}>Return</Text>
              <Text style={styles.coverInfoValue}>{formatDate(trip.endDate)}</Text>
            </View>
            {trip.budget && (
              <View style={styles.coverInfoItem}>
                <Text style={styles.coverInfoLabel}>Budget</Text>
                <Text style={styles.coverInfoValue}>{trip.budget}</Text>
              </View>
            )}
          </View>
        </View>
      </Page>

      {/* 2. Overview & Flights */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Trip Overview</Text>
          {trip.description && (
            <View style={[styles.noteBox, { marginBottom: 20 }]}>
              <Text style={styles.label}>Trip Note</Text>
              <Text style={styles.text}>{trip.description}</Text>
            </View>
          )}
        </View>

        {flights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subSectionHeader}>Flight Itinerary</Text>
            {flights.map((flight, i) => (
              <View key={i} style={styles.card} wrap={false}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardTitle}>
                      {flight.description ||
                        `${flight.segments[0].airline} ${flight.segments[0].flightNumber}`}
                    </Text>
                    <Text style={styles.textSecondary}>
                      {formatDate(flight.segments[0].departureTime)}
                    </Text>
                  </View>
                  {getStatusBadge(flight.isConfirmed)}
                </View>

                {flight.segments.map((seg, j) => (
                  <View key={j} style={styles.segment}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <Text style={[styles.text, { fontWeight: "bold" }]}>
                        {seg.departureAirport} → {seg.arrivalAirport}
                      </Text>
                      <Text style={[styles.text, { color: colors.secondary, fontWeight: "bold" }]}>
                        {seg.airline} {seg.flightNumber}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={styles.textSecondary}>
                        {formatTime(seg.departureTime, seg.departureTimezone)} -{" "}
                        {formatTime(seg.arrivalTime, seg.arrivalTimezone)}
                      </Text>
                      <Text style={[styles.textSecondary, { fontSize: 8 }]}>
                        Duration:{" "}
                        {calculateDuration(seg.departureTime, seg.arrivalTime, {
                          startTimeZone: seg.departureTimezone || "UTC",
                          endTimeZone: seg.arrivalTimezone || "UTC",
                        })}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </Page>

      {/* 3. Destinations & Accommodations */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Destinations & Stays</Text>
          <View style={styles.grid}>
            {trip.tripCountries?.map((tc) => {
              const countryDestinations = destinations.filter((d) => d.tripCountryId === tc.id);
              return (
                <View key={tc.id} style={styles.gridItem}>
                  <View style={styles.card}>
                    <Text style={[styles.countryName, { marginBottom: 8 }]}>{tc.countryName}</Text>
                    {tc.budgetLimit ? (
                      <Text style={[styles.textSecondary, { marginBottom: 8 }]}>
                        Budget: {tc.budgetLimit}
                      </Text>
                    ) : null}

                    <Text style={styles.label}>Destinations</Text>
                    {countryDestinations.length > 0 ? (
                      countryDestinations.map((d, i) => {
                        const destAccs = accommodations.filter((a) => a.destinationId === d.id);
                        return (
                          <View key={i} style={{ marginTop: 4 }}>
                            <Text style={styles.text}>• {d.name}</Text>
                            {destAccs.map((a, j) => (
                              <Text
                                key={j}
                                style={[
                                  styles.textSecondary,
                                  { marginLeft: 12, color: colors.secondary },
                                ]}
                              >
                                Stay: {a.name}
                              </Text>
                            ))}
                          </View>
                        );
                      })
                    ) : (
                      <Text style={[styles.textSecondary]}>No cities specified</Text>
                    )}

                    {tc.notes && (
                      <View style={[styles.noteBox, { marginTop: 10, padding: 8 }]}>
                        <Text style={[styles.textSecondary, { fontSize: 9 }]}>{tc.notes}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {accommodations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subSectionHeader}>Accommodation Details</Text>
            <View style={styles.grid}>
              {accommodations.map((acc, i) => (
                <View key={i} style={styles.gridItem} wrap={false}>
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{acc.name}</Text>
                      {getStatusBadge(acc.isConfirmed)}
                    </View>
                    <Text style={[styles.textSecondary, { marginBottom: 8 }]}>{acc.location}</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <View>
                        <Text style={styles.label}>Check-in</Text>
                        <Text style={styles.text}>{formatDate(acc.checkIn)}</Text>
                      </View>
                      <View>
                        <Text style={styles.label}>Check-out</Text>
                        <Text style={styles.text}>{formatDate(acc.checkOut)}</Text>
                      </View>
                    </View>
                    {acc.image && <Image src={acc.image} style={styles.image} />}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>

      {/* 4. Activity Timeline */}
      {(activities.length > 0 || flights.length > 0) && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Activity Timeline</Text>

            {Array.from(
              new Set([
                ...activities.map((a) => a.date),
                ...flights.flatMap((f) => f.segments.map((s) => s.departureTime.split("T")[0])),
              ]),
            )
              .sort()
              .map((date) => (
                <View key={date} style={{ marginBottom: 20 }}>
                  <Text style={[styles.subSectionHeader, { color: colors.primary, marginTop: 0 }]}>
                    {formatDate(date)}
                  </Text>

                  {/* Render Flights for this day */}
                  {flights
                    .flatMap((f) =>
                      f.segments
                        .filter((s) => s.departureTime.startsWith(date))
                        .map((s) => ({ ...s, isFlight: true, isConfirmed: f.isConfirmed })),
                    )
                    .map((flight, i) => (
                      <View key={`flight-${i}`} style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: colors.secondary }]} />
                        <View
                          style={[
                            styles.card,
                            {
                              marginBottom: 0,
                              borderLeftWidth: 3,
                              borderLeftColor: colors.secondary,
                            },
                          ]}
                        >
                          <View style={styles.cardHeader}>
                            <View>
                              <Text style={[styles.cardTitle, { color: colors.secondary }]}>
                                Flight: {flight.departureAirport} → {flight.arrivalAirport}
                              </Text>
                              <Text style={styles.textSecondary}>
                                {flight.airline} {flight.flightNumber} •{" "}
                                {formatTime(flight.departureTime, flight.departureTimezone)}
                              </Text>
                            </View>
                            {getStatusBadge(flight.isConfirmed)}
                          </View>
                        </View>
                      </View>
                    ))}

                  {/* Render Activities for this day */}
                  {activities
                    .filter((a) => a.date === date)
                    .sort((a, b) => a.order - b.order)
                    .map((act, i) => (
                      <View key={`act-${i}`} style={styles.timelineItem}>
                        <View style={styles.timelineDot} />
                        <View style={[styles.card, { marginBottom: 0 }]}>
                          <View style={styles.cardHeader}>
                            <View>
                              <Text style={styles.cardTitle}>{act.name}</Text>
                              {act.type && (
                                <Text style={[styles.textSecondary, { color: colors.secondary }]}>
                                  {act.type}
                                </Text>
                              )}
                            </View>
                            {getStatusBadge(act.isConfirmed)}
                          </View>
                          {act.notes && <Text style={styles.textSecondary}>{act.notes}</Text>}
                          {act.image && <Image src={act.image} style={styles.image} />}
                        </View>
                      </View>
                    ))}
                </View>
              ))}
          </View>
        </Page>
      )}

      {/* 5. Documents */}
      {documents.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Travel Documents</Text>
            <View style={styles.grid}>
              {documents.map((doc, i) => (
                <View key={i} style={styles.gridItem}>
                  <View style={[styles.card, { flexDirection: "row", alignItems: "center" }]}>
                    <View style={styles.docIcon}>
                      <Text style={{ fontSize: 12 }}>📄</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{doc.name}</Text>
                      <Text style={styles.textSecondary}>{doc.type}</Text>
                      <Link src={doc.file ?? undefined} style={styles.link}>
                        View Document
                      </Link>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Page>
      )}

      {/* 6. General Notes (Last Page) */}
      {notes.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Important Notes</Text>
            {notes.map((note, i) => (
              <View key={i} style={styles.noteBox}>
                <Text style={styles.text}>{note.content}</Text>
                <Text style={[styles.textSecondary, { marginTop: 5, fontSize: 8 }]}>
                  Last updated: {formatDate(note.updatedAt)}
                </Text>
              </View>
            ))}
          </View>
        </Page>
      )}
    </Document>
  );
}
