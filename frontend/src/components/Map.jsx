import { useEffect, useState, useContext } from "react";
import TripMap from "../components/TripMap";
import Layout from "../components/Layout";


const Map = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("mode") === "dark"
    );

    // Apply dark mode class to body
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
            localStorage.setItem("mode", "dark");
        } else {
            document.body.classList.remove("dark");
            localStorage.setItem("mode", "light");
        }
    }, [darkMode]);

    const fetchTrips = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/trips/");
            const data = await response.json();
            setTrips(data);
            setLoading(false);

            // Set available drive time based on the latest trip
            if (data.length > 0) {
                setAvailableDriveTime(data[data.length - 1].available_drive_time);
            } else {
                setAvailableDriveTime(0);  // Default to 0 if no trips exist
            }
        } catch (error) {
            console.error("Error fetching trips:", error);
            setLoading(false);
        }
    };

    const latestTripId = trips.length > 0 ? trips[trips.length - 1].id : null;

    return (
        <Layout>
            <div className="map-page">
                <section className="dashboard">
                    <h1>Test</h1>
                    {latestTripId && <TripMap tripId={latestTripId} />}
                    <br></br>
                    
                </section>
            </div>
        </Layout>
    );
};

export default Map;