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
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
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
  flightBadge: { backgroundColor: colors.secondary },
  accBadge: { backgroundColor: colors.sage },
  actBadge: { backgroundColor: colors.rose },
  text: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  priceText: {
    fontSize: 12,
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
  accImageContainer: {
    width: "100%",
    height: 120,
    marginTop: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  accImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
});

interface BrochureDocumentProps {
  trip: Trip;
  flights: Flight[];
  accommodations: Accommodation[];
  activities: Activity[];
}

export function BrochureDocument({
  trip,
  flights,
  accommodations,
  activities,
}: BrochureDocumentProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDayActivities = (dateStr: string) => {
    return activities.filter((a) => a.date === dateStr).sort((a, b) => a.order - b.order);
  };

  // Get unique dates for timeline
  const timelineDates = Array.from(new Set(activities.map((a) => a.date))).sort();

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

      {/* Overview & Itinerary Details Page */}
      <Page size="A4" style={styles.page}>
        {(trip.description || trip.budget) && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Trip Overview</Text>
            {trip.description && <Text style={styles.text}>{trip.description}</Text>}
            {trip.budget && (
              <Text style={[styles.text, { marginTop: 8 }]}>
                <Text style={{ fontWeight: "bold" }}>Budget: </Text>
                {trip.budget}
              </Text>
            )}
          </View>
        )}

        {flights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Flights</Text>
            {flights.map((flight, i) => (
              <View key={i} style={styles.card}>
                {flight.segments.map((seg, j) => (
                  <View key={j} style={{ marginBottom: j < flight.segments.length - 1 ? 12 : 0 }}>
                    <View style={styles.row}>
                      <Text style={styles.cardTitle}>
                        {seg.departureAirport} to {seg.arrivalAirport}
                      </Text>
                      <View style={[styles.badge, styles.flightBadge]}>
                        <Text>
                          {seg.airline} {seg.flightNumber}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.cardSubtitle}>
                      {formatDate(seg.departureTime)} |{" "}
                      {new Date(seg.departureTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" - "}
                      {new Date(seg.arrivalTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                ))}

                {/* Flight extras: Price, Notes, Links */}
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
                      <Text style={[styles.text, { marginTop: 4, color: colors.textSecondary }]}>
                        {flight.notes}
                      </Text>
                    )}
                    {flight.bookingLink && (
                      <Link src={flight.bookingLink} style={styles.linkText}>
                        View Booking
                      </Link>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {accommodations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Accommodations</Text>
            {accommodations.map((acc, i) => (
              <View key={i} style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.cardTitle}>{acc.name}</Text>
                  <View style={[styles.badge, styles.accBadge]}>
                    <Text>{acc.type.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.cardSubtitle}>{acc.location}</Text>
                <Text style={[styles.text, { marginTop: 4 }]}>
                  {formatDate(acc.checkIn)} to {formatDate(acc.checkOut)}
                </Text>

                {/* Accommodation extras: Price, Notes, Image, Link */}
                {(acc.price > 0 || acc.notes || acc.image || acc.bookingLink) && (
                  <View
                    style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                    }}
                  >
                    {acc.price > 0 && (
                      <Text style={styles.priceText}>
                        Price: {acc.price} {acc.currency}
                      </Text>
                    )}
                    {acc.notes && (
                      <Text style={[styles.text, { marginTop: 4, color: colors.textSecondary }]}>
                        {acc.notes}
                      </Text>
                    )}
                    {acc.bookingLink && (
                      <Link src={acc.bookingLink} style={styles.linkText}>
                        View Booking
                      </Link>
                    )}
                    {acc.image && (
                      <View style={styles.accImageContainer}>
                        <Image src={acc.image} style={styles.accImage} />
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>

      {/* Daily Timeline Page(s) */}
      {timelineDates.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Activity Timeline</Text>
            {timelineDates.map((date) => (
              <View key={date} style={{ marginBottom: 16 }}>
                <Text
                  style={[
                    styles.text,
                    { fontWeight: "bold", color: colors.primary, marginBottom: 8 },
                  ]}
                >
                  {formatDate(date)}
                </Text>
                {getDayActivities(date).map((act, i) => (
                  <View key={i} style={[styles.card, { marginLeft: 16 }]}>
                    <View style={styles.row}>
                      <Text style={styles.cardTitle}>{act.name}</Text>
                      {act.type && (
                        <View style={[styles.badge, styles.actBadge]}>
                          <Text>{act.type.toUpperCase()}</Text>
                        </View>
                      )}
                    </View>
                    {act.notes && (
                      <Text style={[styles.text, { marginTop: 4, color: colors.textSecondary }]}>
                        {act.notes}
                      </Text>
                    )}
                    {((act.cost !== undefined && act.cost > 0) || act.link) && (
                      <View style={{ marginTop: 8 }}>
                        {act.cost !== undefined && act.cost > 0 && (
                          <Text style={styles.priceText}>
                            Cost: {act.cost} {act.currency}
                          </Text>
                        )}
                        {act.link && (
                          <Link src={act.link} style={styles.linkText}>
                            More Info
                          </Link>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </Page>
      )}
    </Document>
  );
}
