# Trip Planner & ELD Logger

## Description
Trip Planner & ELD Logger is a full-stack web application that enables property-carrying truck drivers to plan trips efficiently and maintain compliant Electronic Logging Device (ELD) records. The app accepts trip details, calculates routes, visualizes them on a map, and generates daily log sheets that follow Hours-of-Service (HOS) regulations.

The application was developed as part of a Full Stack Developer assessment and is live-hosted with a Loom walkthrough and public GitHub repository.

## Features
- **User Input**
  - Current location (optional)
  - Pickup location (dropdown from predefined options)
  - Dropoff location (required; dropdown)
  - Hours used in current 70-hour/8-day cycle
- **Route Visualization**
  - Map displays route from pickup to dropoff
  - Includes rest stops and fuel breaks (approx. every 1,000 miles)
  - Uses OpenRouteService API for mapping and geocoding
- **ELD Logs**
  - Auto-generates daily ELD log sheets
  - Compliant with US DOT property-carrying HOS regulations
  - Visual representation of drive time, rest time, and duty status
- **Dropdown for Known Stops**
  - Reduces API call failures by allowing users to select from a list of known depots in Gauteng

## Technologies Used
- **Frontend**: React (Vite), Bootstrap, JavaScript (Fetch API)
- **Backend**: Django, Django REST Framework
- **Database**: SQLite (development), MySQL (production-ready)
- **Other Services**: OpenRouteService API (maps), Vercel (hosting), Loom (video demo)

## Installation

### Clone the repository
```bash
git clone https://github.com/simminda/route_logger.git
cd route_logger
```

### Backend Setup (Django)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup (React)
```bash
cd frontend
npm install
npm run dev
```

Access the app at http://localhost:5173

## Usage
1. Navigate to the trip planner form.
2. Select or enter your current, pickup, and dropoff locations.
3. Enter the hours already used in your current cycle (e.g., 14).
4. Submit to receive a map route and dynamically generated ELD log sheets.
5. Review each day's log sheet to ensure DOT compliance.

## To-Do
- Resolve missing truck issue on Trip form (Done 09/04/2027)
- Investigate console error on Audit ELDLog form submission and provide courtesy feedback
- Implement Google Places or Mapbox Autocomplete
- Enable PDF export of daily log sheets
- Enhance user accounts and trip history
- Enhance Search
- Include distance and estimated time on the route display
- Improve dark mode and mobile responsiveness
- Draw vertical lines to indicate change in status on graphs


## Live Demo and Loom Walkthrough
- 🌐 Live App: https://routelogger.vercel.app/
- 📹 Loom Walkthrough: https://www.loom.com/share/082353663ef84f5890910de1198c7bfe?sid=8569a817-ce8c-4061-b770-c5dd69a7a3fe

## License
This project is open-source and available under the MIT License.

## Author
Developed by Simphiwe Ndaba
- 📍 Johannesburg, South Africa
- 💼 Full-Stack Developer

## Acknowledgments
- Map data and routing provided by OpenRouteService.

## Screenshots

### Welcome Screen
![Welcome Screen](screenshots/0.%20welcome%20screen.png)

### Dashboard
![Dashboard](screenshots/1.%20dashboard.png)

### Directions
![Directions](screenshots/2.%20directions.png)

### ELD Logs
![ELD Logs](screenshots/3.%20logs.png)