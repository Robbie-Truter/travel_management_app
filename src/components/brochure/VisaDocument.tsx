import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Trip, Flight, Accommodation, Activity, Destination } from "@/db/types";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.6,
    color: "#1a1a1a",
  },
  header: {
    marginBottom: 30,
    borderBottom: 1,
    borderBottomColor: "#000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    padding: 5,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  grid: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 10,
  },
  gridCol: {
    flex: 1,
  },
  label: {
    fontWeight: "bold",
    width: 100,
  },
  value: {
    flex: 1,
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomColor: "#bfbfbf",
    borderBottomWidth: 1,
    minHeight: 25,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#f8f9fa",
    fontWeight: "bold",
  },
  tableCol: {
    padding: 5,
    borderRightColor: "#bfbfbf",
    borderRightWidth: 1,
  },
  colDate: { width: "15%" },
  colLocation: { width: "25%" },
  colActivity: { width: "35%" },
  colAccommodation: { width: "25%", borderRightWidth: 0 },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: "center",
    fontSize: 8,
    color: "#666",
    borderTop: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  letterBody: {
    marginBottom: 20,
    textAlign: "justify",
  },
  signature: {
    marginTop: 40,
  },
});

interface VisaDocumentProps {
  trip: Trip;
  flights: Flight[];
  accommodations: Accommodation[];
  activities: Activity[];
  destinations: Destination[];
  personalInfo: {
    fullName: string;
    passportNumber: string;
    nationality: string;
    address: string;
    purpose: string;
  };
}

export function VisaDocument({
  trip,
  flights,
  accommodations,
  activities,
  destinations,
  personalInfo,
}: VisaDocumentProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Generate a chronological daily itinerary
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const days: { date: string; city: string; activity: string; stay: string }[] = [];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];

    // Find city for this date
    const dayDest =
      destinations.find((dest) => {
        const stay = accommodations.find(
          (a) => a.destinationId === dest.id && dateStr >= a.checkIn && dateStr < a.checkOut,
        );
        return !!stay;
      }) || destinations[0];

    // Find stay
    const stay = accommodations.find((a) => dateStr >= a.checkIn && dateStr < a.checkOut);

    // Find activity
    const dayActivities = activities.filter((a) => a.date === dateStr);

    days.push({
      date: formatDate(dateStr),
      city: dayDest?.name || "In Transit",
      activity:
        dayActivities.map((a) => a.name).join(", ") || "City Sightseeing / Personal Itinerary",
      stay: stay?.name || "Confirmed Booking (See Attachment)",
    });
  }

  return (
    <Document title={`Visa_Itinerary_${personalInfo.fullName.replace(/\s+/g, "_")}`}>
      {/* 1. Cover Letter / Personal Data */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Detailed Flight & Travel Itinerary</Text>
          <Text style={styles.subtitle}>For Schengen Visa Application</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Applicant Information</Text>
          <View style={styles.grid}>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.value}>{personalInfo.fullName}</Text>
          </View>
          <View style={styles.grid}>
            <Text style={styles.label}>Passport No:</Text>
            <Text style={styles.value}>{personalInfo.passportNumber}</Text>
          </View>
          <View style={styles.grid}>
            <Text style={styles.label}>Nationality:</Text>
            <Text style={styles.value}>{personalInfo.nationality}</Text>
          </View>
          <View style={styles.grid}>
            <Text style={styles.label}>Home Address:</Text>
            <Text style={styles.value}>{personalInfo.address}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Trip Summary</Text>
          <View style={styles.grid}>
            <Text style={styles.label}>Purpose of Visit:</Text>
            <Text style={styles.value}>{personalInfo.purpose}</Text>
          </View>
          <View style={styles.grid}>
            <Text style={styles.label}>Duration:</Text>
            <Text style={styles.value}>{days.length} Days</Text>
          </View>
          <View style={styles.grid}>
            <Text style={styles.label}>Travel Dates:</Text>
            <Text style={styles.value}>
              {formatDate(trip.startDate)} to {formatDate(trip.endDate)}
            </Text>
          </View>
        </View>

        <View style={styles.letterBody}>
          <Text>To Whom It May Concern,</Text>
          <Text style={{ marginTop: 10 }}>
            I am submitting this detailed itinerary as part of my Schengen visa application for my
            upcoming trip to {trip.tripCountries.map((tc) => tc.countryName).join(", ")}. This
            document outlines my confirmed flight reservations, accommodation bookings, and planned
            activities during my stay.
          </Text>
          <Text style={{ marginTop: 10 }}>
            All accommodations listed have been confirmed, and proof of these bookings is attached
            to my primary application. I intend to strictly adhere to the itinerary provided below.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Flight Summary</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={[styles.tableCol, { width: "20%" }]}>
                <Text>Date</Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text>Flight No</Text>
              </View>
              <View style={[styles.tableCol, { width: "30%" }]}>
                <Text>Route</Text>
              </View>
              <View style={[styles.tableCol, { width: "25%", borderRightWidth: 0 }]}>
                <Text>Status</Text>
              </View>
            </View>
            {flights.map((f, i) => (
              <View key={i} style={styles.tableRow}>
                <View style={[styles.tableCol, { width: "20%" }]}>
                  <Text>{formatDate(f.segments[0].departureTime)}</Text>
                </View>
                <View style={[styles.tableCol, { width: "25%" }]}>
                  <Text>
                    {f.segments[0].airline} {f.segments[0].flightNumber}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "30%" }]}>
                  <Text>
                    {f.segments[0].departureAirport} -{" "}
                    {f.segments[f.segments.length - 1].arrivalAirport}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "25%", borderRightWidth: 0 }]}>
                  <Text>{f.isConfirmed ? "Confirmed" : "Reservation"}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.signature}>
          <Text>Sincerely,</Text>
          <Text
            style={{ marginTop: 20, borderBottom: 1, borderBottomColor: "#000", width: 150 }}
          ></Text>
          <Text style={{ marginTop: 5 }}>{personalInfo.fullName}</Text>
          <Text>Date: {formatDate(new Date().toISOString())}</Text>
        </View>

        <Text style={styles.footer}>Generated via Wanderplan Travel Management System</Text>
      </Page>

      {/* 2. Detailed Daily Itinerary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Itinerary Details</Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCol, styles.colDate]}>
              <Text>Date</Text>
            </View>
            <View style={[styles.tableCol, styles.colLocation]}>
              <Text>Location</Text>
            </View>
            <View style={[styles.tableCol, styles.colActivity]}>
              <Text>Planned Activities</Text>
            </View>
            <View style={[styles.tableCol, styles.colAccommodation]}>
              <Text>Accommodation</Text>
            </View>
          </View>
          {days.map((day, i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <View style={[styles.tableCol, styles.colDate]}>
                <Text>{day.date}</Text>
              </View>
              <View style={[styles.tableCol, styles.colLocation]}>
                <Text>{day.city}</Text>
              </View>
              <View style={[styles.tableCol, styles.colActivity]}>
                <Text>{day.activity}</Text>
              </View>
              <View style={[styles.tableCol, styles.colAccommodation]}>
                <Text>{day.stay}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Page 2 - Detailed Itinerary for {personalInfo.fullName}</Text>
      </Page>
    </Document>
  );
}
