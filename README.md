☕ CafeApp - Mobile Coffee Management System
A high-fidelity mobile application prototype for coffee shop management. Built with React Native, Expo Router, and Supabase, featuring a modern UI and robust role-based access control.

🚀 Key Features
Multi-Role System: Tailored experiences for Admin, Barista, and Customer.

Theming: Full Dark/Light mode support with a custom toggle and system sync.

Dynamic Content: Real-time data fetching for Campaigns and Recipes.

Admin Suite: Comprehensive management for users, roles, and content (CRUD).

Modern Navigation: File-based routing with Expo Router and interactive Tab Bars.

🛠️ Installation & Setup
Follow these steps to get the project running on your local machine.

1. Prerequisites

Before you begin, make sure you have the following installed:

Node.js (LTS version)

Git

Expo Go app on your mobile device (to preview the app live)

2. Clone the Repository

Bash
git clone https://github.com/BaturalpDuran/CafeApp.git
cd CafeApp 3. Install Dependencies

Run the following command to install all necessary packages and libraries:

Bash
npm install
This will set up React Native, Expo, Supabase Client, and all UI dependencies.

4. Supabase Configuration

The project is pre-configured with the prototype's database credentials. You can find them in:
src/lib/supabase.js

Note: If you want to use your own Supabase instance, simply update the supabaseUrl and supabaseAnonKey in that file with your own project credentials.

5. Start the Application

Launch the development server by running:

Bash
npx expo start
Once the server is running:

iOS/Android: Scan the QR code using the Expo Go app.

Emulator: Press i for iOS or a for Android simulator on your Mac.

📂 Project Architecture
app/: Routing logic and screens (Auth, Home, Admin Tabs).

context/: Global State Management (Theme Context).

constants/: Design tokens (Colors, Theme constants).

lib/: Configuration for external services (Supabase).

🧪 Test Accounts
Use the following credentials to explore different roles:

Admin: admin@cafeapp.com / 1

Barista: barista@cafeapp.com / 1

Customer: musteri@cafeapp.com / 1

Developed with ❤️ by Baturalp DURAN
