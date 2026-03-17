import { Document, Page, Text, View, StyleSheet, Font, Image, Link } from "@react-pdf/renderer";
import type { Trip, Flight, Accommodation, Activity } from "@/db/types";

// Register a font for a cleaner look
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

// Pastel colors to match the app
const colors = {
  primary: "#8b5cf6", // lavender-500
  secondary: "#36aaf6", // sky-pastel-400
  textPrimary: "#1e293b", // slate-800
  textSecondary: "#64748b", // slate-500
  surface: "#f8fafc", // slate-50
  border: "#e2e8f0", // slate-200
  sage: "#7da47d", // sage-400
  rose: "#fb7185", // rose-pastel-400
  amber: "#fbbf24", // amber-pastel-400
  confirmed: "#059669", // emerald-600
  planning: "#d97706", // amber-600
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    padding: 40,
    backgroundColor: "#ffffff",
    color: colors.textPrimary,
  },
  coverPage: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    padding: 60,
  },
  coverImage: {
    width: "100%",
    height: 300,
    objectFit: "cover",
    borderRadius: 12,
    marginBottom: 32,
  },
  coverTitle: {
    fontSize: 42,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 16,
    textAlign: "center",
  },
  coverDestinations: {
    fontSize: 24,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: "center",
  },
  coverDates: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 16,
  },
  countryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f1f5f9",
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    marginTop: 8,
  },
  countryLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  itemCount: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    maxWidth: "70%",
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
  },
  statusBadge: {
    fontSize: 9,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  confirmedBadge: {
    backgroundColor: "#ecfdf5",
    color: colors.confirmed,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  planningBadge: {
    backgroundColor: "#fffbeb",
    color: colors.planning,
    borderWidth: 1,
    borderColor: "#fef3c7",
  },
  flightBadge: { backgroundColor: colors.secondary },
  accBadge: { backgroundColor: colors.sage },
  actBadge: { backgroundColor: colors.rose },
  text: {
    fontSize: 11,
    lineHeight: 1.4,
  },
  label: {
    fontWeight: "bold",
    color: colors.textSecondary,
  },
  priceText: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 4,
  },
  linkText: {
    fontSize: 10,
    color: colors.secondary,
    textDecoration: "underline",
    marginTop: 4,
  },
  imageContainer: {
    width: "100%",
    height: 140,
    marginTop: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noteBox: {
    padding: 12,
    backgroundColor: "#fff7ed",
    borderLeftWidth: 3,
    borderLeftColor: "#fb923c",
    marginTop: 12,
    fontStyle: "italic",
  },
});

interface BrochureDocumentProps {
  trip: Trip;
  flights: Flight[];
  accommodations: Accommodation[];
  activities: Activity[];
  note?: string;
}

export function BrochureDocument({
  trip,
  flights,
  accommodations,
  activities,
  note,
}: BrochureDocumentProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeStyle = (isConfirmed: boolean) => {
    return [styles.statusBadge, isConfirmed ? styles.confirmedBadge : styles.planningBadge];
  };

  const getStatusText = (isConfirmed: boolean) => (isConfirmed ? "CONFIRMED" : "PLANNING");

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          {trip.coverImage && <Image src={trip.coverImage} style={styles.coverImage} />}
          <Text style={styles.coverTitle}>{trip.name}</Text>
          <Text style={styles.coverDestinations}>{trip.destinations.join(" • ")}</Text>
          <Text style={styles.coverDates}>
            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
          </Text>
        </View>
      </Page>

      {/* Overview Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Trip Overview</Text>
          {trip.description && <Text style={styles.text}>{trip.description}</Text>}
          {trip.budget && (
            <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.text, styles.label]}>Budget: </Text>
              <Text style={styles.text}>{trip.budget}</Text>
            </View>
          )}

          {note && (
            <View style={styles.noteBox}>
              <Text style={[styles.text, { color: "#9a3412" }]}>"{note}"</Text>
            </View>
          )}
        </View>

        {/* FLIGHTS SECTION (Grouped by Country) */}
        {flights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Flights</Text>
            {trip.destinations.map((country) => {
              const countryFlights = flights.filter((f) => f.country === country);
              if (countryFlights.length === 0) return null;

              return (
                <View key={country}>
                  <View style={styles.countryHeader}>
                    <Text style={styles.countryLabel}>{country}</Text>
                    <Text style={styles.itemCount}>
                      {countryFlights.length} {countryFlights.length === 1 ? "Flight" : "Flights"}
                    </Text>
                  </View>

                  {countryFlights.map((flight, i) => (
                    <View key={i} style={styles.card}>
                      <View style={styles.row}>
                        <Text style={styles.cardTitle}>
                          {flight.description ||
                            `${flight.segments[0].airline} ${flight.segments[0].flightNumber}`}
                        </Text>
                        <View style={getStatusBadgeStyle(flight.isConfirmed)}>
                          <Text>{getStatusText(flight.isConfirmed)}</Text>
                        </View>
                      </View>

                      {flight.segments.map((seg, j) => (
                        <View
                          key={j}
                          style={{
                            marginTop: 8,
                            paddingTop: 8,
                            borderTopWidth: j > 0 ? 1 : 0,
                            borderTopColor: colors.border,
                            borderTopStyle: "dashed",
                          }}
                        >
                          <View style={styles.row}>
                            <Text style={[styles.text, { fontWeight: "bold" }]}>
                              {seg.departureAirport} → {seg.arrivalAirport}
                            </Text>
                            <View style={[styles.badge, styles.flightBadge]}>
                              <Text>
                                {seg.airline} {seg.flightNumber}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.cardSubtitle}>
                            {formatDate(seg.departureTime)} | {formatTime(seg.departureTime)} -{" "}
                            {formatTime(seg.arrivalTime)}
                          </Text>
                        </View>
                      ))}

                      {(flight.price > 0 || flight.notes || flight.bookingLink) && (
                        <View
                          style={{
                            marginTop: 8,
                            paddingTop: 8,
                            borderTopWidth: 1,
                            borderTopColor: colors.border,
                          }}
                        >
                          {flight.price > 0 && (
                            <Text style={styles.priceText}>
                              Price: {flight.price} {flight.currency}
                            </Text>
                          )}
                          {flight.notes && (
                            <Text
                              style={[styles.text, { marginTop: 4, color: colors.textSecondary }]}
                            >
                              {flight.notes}
                            </Text>
                          )}
                          {flight.bookingLink && (
                            <Link src={flight.bookingLink} style={styles.linkText}>
                              View Booking Details
                            </Link>
                          )}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              );
            })}

            {/* Other Flights Fallback */}
            {(() => {
              const otherFlights = flights.filter(
                (f) => !f.country || !trip.destinations.includes(f.country),
              );
              if (otherFlights.length === 0) return null;

              return (
                <View>
                  <View style={styles.countryHeader}>
                    <Text style={styles.countryLabel}>Other Locations</Text>
                    <Text style={styles.itemCount}>
                      {otherFlights.length} {otherFlights.length === 1 ? "Flight" : "Flights"}
                    </Text>
                  </View>
                  {otherFlights.map((flight, i) => (
                    <View key={i} style={styles.card}>
                      <View style={styles.row}>
                        <Text style={styles.cardTitle}>
                          {flight.description ||
                            `${flight.segments[0].airline} ${flight.segments[0].flightNumber}`}
                        </Text>
                        <View style={getStatusBadgeStyle(flight.isConfirmed)}>
                          <Text>{getStatusText(flight.isConfirmed)}</Text>
                        </View>
                      </View>
                      {flight.segments.map((seg, j) => (
                        <View
                          key={j}
                          style={{
                            marginTop: 8,
                            paddingTop: 8,
                            borderTopWidth: j > 0 ? 1 : 0,
                            borderTopColor: colors.border,
                            borderTopStyle: "dashed",
                          }}
                        >
                          <View style={styles.row}>
                            <Text style={[styles.text, { fontWeight: "bold" }]}>
                              {seg.departureAirport} → {seg.arrivalAirport}
                            </Text>
                            <View style={[styles.badge, styles.flightBadge]}>
                              <Text>
                                {seg.airline} {seg.flightNumber}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.cardSubtitle}>
                            {formatDate(seg.departureTime)} | {formatTime(seg.departureTime)} -{" "}
                            {formatTime(seg.arrivalTime)}
                          </Text>
                        </View>
                      ))}
                      {(flight.price > 0 || flight.notes || flight.bookingLink) && (
                        <View
                          style={{
                            marginTop: 8,
                            paddingTop: 8,
                            borderTopWidth: 1,
                            borderTopColor: colors.border,
                          }}
                        >
                          {flight.price > 0 && (
                            <Text style={styles.priceText}>
                              Price: {flight.price} {flight.currency}
                            </Text>
                          )}
                          {flight.notes && (
                            <Text
                              style={[styles.text, { marginTop: 4, color: colors.textSecondary }]}
                            >
                              {flight.notes}
                            </Text>
                          )}
                          {flight.bookingLink && (
                            <Link src={flight.bookingLink} style={styles.linkText}>
                              View Booking Details
                            </Link>
                          )}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              );
            })()}
          </View>
        )}
      </Page>

      {/* ACCOMMODATIONS PAGE */}
      {accommodations.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Accommodations</Text>
            {trip.destinations.map((country) => {
              const countryAccs = accommodations.filter((a) => a.country === country);
              if (countryAccs.length === 0) return null;

              return (
                <View key={country}>
                  <View style={styles.countryHeader}>
                    <Text style={styles.countryLabel}>{country}</Text>
                    <Text style={styles.itemCount}>
                      {countryAccs.length} {countryAccs.length === 1 ? "Stay" : "Stays"}
                    </Text>
                  </View>

                  {countryAccs.map((acc, i) => (
                    <View key={i} style={styles.card}>
                      <View style={styles.row}>
                        <Text style={styles.cardTitle}>{acc.name}</Text>
                        <View style={getStatusBadgeStyle(acc.isConfirmed)}>
                          <Text>{getStatusText(acc.isConfirmed)}</Text>
                        </View>
                      </View>

                      <View style={styles.row}>
                        <Text style={styles.cardSubtitle}>{acc.location}</Text>
                        <View style={[styles.badge, styles.accBadge]}>
                          <Text>{acc.type.toUpperCase()}</Text>
                        </View>
                      </View>

                      {acc.platform && (
                        <Text style={[styles.text, { marginTop: 4, color: colors.textSecondary }]}>
                          Platform: <Text style={{ fontWeight: "bold" }}>{acc.platform}</Text>
                        </Text>
                      )}

                      <View
                        style={{
                          marginTop: 6,
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <View>
                          <Text style={[styles.text, styles.label]}>Check-in</Text>
                          <Text style={styles.text}>{formatDate(acc.checkIn)}</Text>
                          {acc.checkInAfter && (
                            <Text style={[styles.text, { fontSize: 9 }]}>
                              After {acc.checkInAfter}
                            </Text>
                          )}
                        </View>
                        <View>
                          <Text style={[styles.text, styles.label]}>Check-out</Text>
                          <Text style={styles.text}>{formatDate(acc.checkOut)}</Text>
                          {acc.checkOutBefore && (
                            <Text style={[styles.text, { fontSize: 9 }]}>
                              Before {acc.checkOutBefore}
                            </Text>
                          )}
                        </View>
                      </View>

                      {(acc.price > 0 || acc.notes || acc.image || acc.bookingLink) && (
                        <View
                          style={{
                            marginTop: 10,
                            paddingTop: 8,
                            borderTopWidth: 1,
                            borderTopColor: colors.border,
                          }}
                        >
                          {acc.price > 0 && (
                            <Text style={styles.priceText}>
                              Total: {acc.price} {acc.currency}
                            </Text>
                          )}
                          {acc.notes && (
                            <Text
                              style={[styles.text, { marginTop: 4, color: colors.textSecondary }]}
                            >
                              {acc.notes}
                            </Text>
                          )}
                          {acc.bookingLink && (
                            <Link src={acc.bookingLink} style={styles.linkText}>
                              View Booking Confirmation
                            </Link>
                          )}
                          {acc.image && (
                            <View style={styles.imageContainer}>
                              <Image src={acc.image} style={styles.itemImage} />
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              );
            })}

            {/* Other Stays Fallback */}
            {(() => {
              const otherAccs = accommodations.filter(
                (a) => !a.country || !trip.destinations.includes(a.country),
              );
              if (otherAccs.length === 0) return null;

              return (
                <View>
                  <View style={styles.countryHeader}>
                    <Text style={styles.countryLabel}>Other Locations</Text>
                    <Text style={styles.itemCount}>
                      {otherAccs.length} {otherAccs.length === 1 ? "Stay" : "Stays"}
                    </Text>
                  </View>
                  {otherAccs.map((acc, i) => (
                    <View key={i} style={styles.card}>
                      <View style={styles.row}>
                        <Text style={styles.cardTitle}>{acc.name}</Text>
                        <View style={getStatusBadgeStyle(acc.isConfirmed)}>
                          <Text>{getStatusText(acc.isConfirmed)}</Text>
                        </View>
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.cardSubtitle}>{acc.location}</Text>
                        <View style={[styles.badge, styles.accBadge]}>
                          <Text>{acc.type.toUpperCase()}</Text>
                        </View>
                      </View>
                      {acc.platform && (
                        <Text style={[styles.text, { marginTop: 4, color: colors.textSecondary }]}>
                          Platform: <Text style={{ fontWeight: "bold" }}>{acc.platform}</Text>
                        </Text>
                      )}
                      <View
                        style={{
                          marginTop: 6,
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <View>
                          <Text style={[styles.text, styles.label]}>Check-in</Text>
                          <Text style={styles.text}>{formatDate(acc.checkIn)}</Text>
                          {acc.checkInAfter && (
                            <Text style={[styles.text, { fontSize: 9 }]}>
                              After {acc.checkInAfter}
                            </Text>
                          )}
                        </View>
                        <View>
                          <Text style={[styles.text, styles.label]}>Check-out</Text>
                          <Text style={styles.text}>{formatDate(acc.checkOut)}</Text>
                          {acc.checkOutBefore && (
                            <Text style={[styles.text, { fontSize: 9 }]}>
                              Before {acc.checkOutBefore}
                            </Text>
                          )}
                        </View>
                      </View>
                      {(acc.price > 0 || acc.notes || acc.image || acc.bookingLink) && (
                        <View
                          style={{
                            marginTop: 10,
                            paddingTop: 8,
                            borderTopWidth: 1,
                            borderTopColor: colors.border,
                          }}
                        >
                          {acc.price > 0 && (
                            <Text style={styles.priceText}>
                              Total: {acc.price} {acc.currency}
                            </Text>
                          )}
                          {acc.notes && (
                            <Text
                              style={[styles.text, { marginTop: 4, color: colors.textSecondary }]}
                            >
                              {acc.notes}
                            </Text>
                          )}
                          {acc.bookingLink && (
                            <Link src={acc.bookingLink} style={styles.linkText}>
                              View Booking Confirmation
                            </Link>
                          )}
                          {acc.image && (
                            <View style={styles.imageContainer}>
                              <Image src={acc.image} style={styles.itemImage} />
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              );
            })()}
          </View>
        </Page>
      )}

      {/* ACTIVITIES TIMELINE PAGE(S) */}
      {activities.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Activity Timeline</Text>
            {trip.destinations.map((country) => {
              const countryActivities = activities.filter((a) => a.country === country);
              if (countryActivities.length === 0) return null;

              // Group activities by date within the country group
              const dates = Array.from(new Set(countryActivities.map((a) => a.date))).sort();

              return (
                <View key={country} style={{ marginBottom: 20 }}>
                  <View style={styles.countryHeader}>
                    <Text style={styles.countryLabel}>{country}</Text>
                    <Text style={styles.itemCount}>
                      {countryActivities.length}{" "}
                      {countryActivities.length === 1 ? "Activity" : "Activities"}
                    </Text>
                  </View>

                  {dates.map((date) => (
                    <View key={date} style={{ marginBottom: 16, marginLeft: 10 }}>
                      <Text
                        style={[
                          styles.text,
                          { fontWeight: "bold", color: colors.primary, marginBottom: 8 },
                        ]}
                      >
                        {formatDate(date)}
                      </Text>
                      {countryActivities
                        .filter((a) => a.date === date)
                        .sort((a, b) => a.order - b.order)
                        .map((act, i) => (
                          <View key={i} style={[styles.card, { marginLeft: 16 }]}>
                            <View style={styles.row}>
                              <Text style={styles.cardTitle}>{act.name}</Text>
                              <View style={getStatusBadgeStyle(act.isConfirmed)}>
                                <Text>{getStatusText(act.isConfirmed)}</Text>
                              </View>
                            </View>

                            <View style={styles.row}>
                              {act.type && (
                                <View style={[styles.badge, styles.actBadge]}>
                                  <Text>{act.type.toUpperCase()}</Text>
                                </View>
                              )}
                              {act.duration && (
                                <Text style={[styles.text, { color: colors.textSecondary }]}>
                                  Duration: {act.duration} mins
                                </Text>
                              )}
                            </View>

                            {act.notes && (
                              <Text
                                style={[styles.text, { marginTop: 4, color: colors.textSecondary }]}
                              >
                                {act.notes}
                              </Text>
                            )}
                            {((act.cost !== undefined && act.cost > 0) ||
                              act.link ||
                              act.image) && (
                              <View style={{ marginTop: 8 }}>
                                {act.cost !== undefined && act.cost > 0 && (
                                  <Text style={styles.priceText}>
                                    Cost: {act.cost} {act.currency}
                                  </Text>
                                )}
                                {act.link && (
                                  <Link src={act.link} style={styles.linkText}>
                                    More Information
                                  </Link>
                                )}
                                {act.image && (
                                  <View style={styles.imageContainer}>
                                    <Image src={act.image} style={styles.itemImage} />
                                  </View>
                                )}
                              </View>
                            )}
                          </View>
                        ))}
                    </View>
                  ))}
                </View>
              );
            })}

            {/* Other Activities Fallback */}
            {(() => {
              const otherActivities = activities.filter(
                (a) => !a.country || !trip.destinations.includes(a.country),
              );
              if (otherActivities.length === 0) return null;
              const dates = Array.from(new Set(otherActivities.map((a) => a.date))).sort();

              return (
                <View style={{ marginTop: 20 }}>
                  <View style={styles.countryHeader}>
                    <Text style={styles.countryLabel}>Other Locations</Text>
                    <Text style={styles.itemCount}>
                      {otherActivities.length}{" "}
                      {otherActivities.length === 1 ? "Activity" : "Activities"}
                    </Text>
                  </View>
                  {dates.map((date) => (
                    <View key={date} style={{ marginBottom: 16, marginLeft: 10 }}>
                      <Text
                        style={[
                          styles.text,
                          { fontWeight: "bold", color: colors.primary, marginBottom: 8 },
                        ]}
                      >
                        {formatDate(date)}
                      </Text>
                      {otherActivities
                        .filter((a) => a.date === date)
                        .sort((a, b) => a.order - b.order)
                        .map((act, i) => (
                          <View key={i} style={[styles.card, { marginLeft: 16 }]}>
                            <View style={styles.row}>
                              <Text style={styles.cardTitle}>{act.name}</Text>
                              <View style={getStatusBadgeStyle(act.isConfirmed)}>
                                <Text>{getStatusText(act.isConfirmed)}</Text>
                              </View>
                            </View>
                            <View style={styles.row}>
                              {act.type && (
                                <View style={[styles.badge, styles.actBadge]}>
                                  <Text>{act.type.toUpperCase()}</Text>
                                </View>
                              )}
                              {act.duration && (
                                <Text style={[styles.text, { color: colors.textSecondary }]}>
                                  Duration: {act.duration} mins
                                </Text>
                              )}
                            </View>
                            {act.notes && (
                              <Text
                                style={[styles.text, { marginTop: 4, color: colors.textSecondary }]}
                              >
                                {act.notes}
                              </Text>
                            )}
                            {((act.cost !== undefined && act.cost > 0) ||
                              act.link ||
                              act.image) && (
                              <View style={{ marginTop: 8 }}>
                                {act.cost !== undefined && act.cost > 0 && (
                                  <Text style={styles.priceText}>
                                    Cost: {act.cost} {act.currency}
                                  </Text>
                                )}
                                {act.link && (
                                  <Link src={act.link} style={styles.linkText}>
                                    More Information
                                  </Link>
                                )}
                                {act.image && (
                                  <View style={styles.imageContainer}>
                                    <Image src={act.image} style={styles.itemImage} />
                                  </View>
                                )}
                              </View>
                            )}
                          </View>
                        ))}
                    </View>
                  ))}
                </View>
              );
            })()}
          </View>
        </Page>
      )}
    </Document>
  );
}
