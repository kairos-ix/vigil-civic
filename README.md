# Vigil - Civic Issue Reporting Platform

> **Hackathon Project by Sahil**
> 
> *Disclaimer: This is a hackathon prototype designed to demonstrate a proof-of-concept. It was built rapidly to address a critical, real-world need: fixing the broken feedback loop between citizens reporting civic issues and the city officials responsible for resolving them.*
>
> *Our cities suffer from a "civic trust leak" — citizens stop reporting problems because they never see the results, and reports go into invisible queues. Vigil bridges this gap through transparency, AI triage, community verification, and gamified civic engagement.*

## Project Overview & Value Proposition
Vigil is a modern civic reporting platform that turns scattered community complaints (like potholes, broken streetlights, or drainage issues) into structured, actionable intelligence. 

Instead of sending reports into an invisible queue, Vigil allows citizens to upload photos of issues. It uses Google's Gemini Vision AI to automatically categorize the issue and assess its severity. Every report gets a public timeline, allowing other citizens to verify the issue and track its resolution status. Citizens earn reputation points for their civic contributions, and city officials get a clean dashboard to manage and resolve real-world problems efficiently based on AI-clustered geographic data.

## Tech Stack
This project is built using:
- **Framework:** Next.js 16.2.9 (App Router, React 19)
- **Styling:** Tailwind CSS v4, shadcn/ui components
- **Database:** MongoDB (via Mongoose)
- **Authentication:** Custom JWT with bcrypt password hashing, and Resend for email verification/password reset
- **AI & Processing:** Google Gemini API (`@google/generative-ai`) for image analysis and insight generation
- **Media Storage:** Cloudinary for issue image hosting
- **Mapping:** Leaflet & React Leaflet for the live geographic map

## Core Features & User Flow

**1. Secure Authentication**
- **How it works:** Users register with an email and password. The system sends a 6-digit verification code via email using Resend.
- **Tech Flow:** Custom JWTs are stored in HTTP-only cookies. Passwords are encrypted with bcrypt. 

**2. AI-Powered Issue Reporting**
- **How it works:** A citizen uploads a photo of a civic issue (e.g., a pothole).
- **Tech Flow:** The image is uploaded securely to Cloudinary. The image URL is passed to Gemini Vision AI, which automatically extracts the issue category (e.g., `road_damage`), assigns a severity level (`low` to `critical`), and generates a descriptive title. The issue is saved to MongoDB.

**3. Duplicate & Cluster Detection**
- **How it works:** If a user reports a pothole that someone else already reported nearby recently, the system groups them. If many issues happen in the same area, it triggers an infrastructure alert.
- **Tech Flow:** MongoDB Geospatial queries (`$geoWithin` and `$nearSphere`) scan for issues within a 200m radius over the last 7 days. If a duplicate is found, it automatically adds the user's upvote to the existing ticket. If more than 3 issues cluster within 500m in 30 days, Gemini generates an "Area Insight" alert for city officials.

**4. Transparent Status Timelines & Verification**
- **How it works:** Every issue page features a public timeline showing exactly when a report was submitted, verified by the community, and resolved by the city.
- **Tech Flow:** Users can click "Verify" on an issue, appending their user ID to the issue's upvote array. Status changes (handled by the Official Control Panel) are recorded with timestamps in the MongoDB database and rendered dynamically on the issue's detail page.

**5. Civic Trust & Gamification**
- **How it works:** Users earn points and level up by actively participating in their community.
- **Tech Flow:** A centralized scoring utility awards points (e.g., 10 points for reporting, 5 points for verifying). Badges are awarded dynamically as users hit specific point thresholds, incentivizing continuous civic engagement.

**6. Live Map & Dashboard Feed**
- **How it works:** Users can see a feed of trending issues or view them plotted on a live city map.
- **Tech Flow:** The map uses Leaflet.js to plot GeoJSON coordinates fetched from the MongoDB cluster.

**7. Official Control Panel**
- **How it works:** City officials have a dedicated dashboard to view prioritized issues and update the status of reports (e.g., marking a pothole as "In Progress" or "Resolved").
- **Tech Flow:** A protected route (`/official`) allows users with the `official` role in the database to trigger database updates that push the new status to the public timeline.

## Setup / Running Locally

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Environment Variables:**
   Copy the example environment file and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```
   You will need active API keys for MongoDB, Gemini, Resend, and Cloudinary.

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## Future Roadmap (Current Limitations)
*Note: This platform is currently a prototype built rapidly for a hackathon.*

- **Dynamic Map Boundaries:** The map currently defaults to a hardcoded center (Ahmedabad). Future versions will use browser geolocation or user-set preferences to bound the map properly.
- **Role-Based Access Control (RBAC):** While the `/official` page restricts access to officials, the UI navigation logic needs deeper RBAC integration to hide irrelevant views from standard citizens.
- **Notification Delivery:** The `notifyCityUsers` logic is currently stubbed out and requires full integration with Push Notifications or WebSockets.
- **Department Routing:** Future versions will automatically dispatch tickets to specific city departments (e.g., Water, Roads, Sanitation) based on the AI categorization.
