# Wanderplan – Personal Travel Planner 🌍

Wanderplan is a polished, single-user travel planning application designed to help you organize every aspect of your upcoming adventures. Built for the modern traveler, it runs entirely in your browser and ensures your data is private and secure by using local IndexedDB storage.

---

## ✨ Key Features

- **Dashboard**: A beautiful, card-based interface providing an bird's-eye view of all your trips.
- **Flight Management**: Add and track flight options, including airlines, flight numbers, and real-time status tracking. Includes a side-by-side comparison view to help you choose the best option.
- **Accommodation (Stays)**: Manage hotel, Airbnb, or hostel bookings with full check-in/out details and pricing.
- **Activities Planner**: Build your itinerary by adding attractions, tours, and bookings.
- **Drag-and-Drop Itinerary**: A dedicated "Planner" view where you can visually organize your confirmed activities and stays day-by-day.
- **Smart Notes**: A dedicated space for trip-specific notes with auto-saving and helpful AI-powered travel insights.
- **Personalization**: Upload your own cover images for each trip to make your dashboard uniquely yours.
- **Import/Export**: Easily back up your data or move it to another device by exporting trips as JSON files.
- **Dark Mode**: A sleek interface that adapts to your preference, whether you're planning in full daylight or late at night.

---

## 🛠️ Technical Stack

Wanderplan is built using modern frontend technologies for performance and reliability:

- **Frontend**: [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI)
- **Database**: [Dexie.js](https://dexie.org/) (for robust IndexedDB management)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Drag & Drop**: [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd travel_management_app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## 🔒 Privacy & Data

Wanderplan values your privacy. **All data is stored locally in your browser's IndexedDB.** No information is ever sent to a server. You can use the **Export** feature to create manual backups of your trip data.

---

## 📸 Screenshots & Documentation

Detailed development walkthroughs and implementation plans can be found in the `.gemini/antigravity/brain` directory (internal to the project assistant).

---

*Planned and implemented as a high-performance, local-first web application.*
