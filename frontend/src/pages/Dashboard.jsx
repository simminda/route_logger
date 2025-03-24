
import { useEffect, useState, useContext } from "react";
import "../style.css" 
import Sidebar from "../components/Sidebar";
import TripForm from "../components/TripForm";
import AuthContext from "../context/AuthContext";


const Dashboard = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("mode") === "dark"
    );
    
    useEffect(() => {
    fetch("http://127.0.0.1:8000/api/trips/")
        .then((response) => response.json())
        .then((data) => {
        setTrips(data);
        setLoading(false);
        })
        .catch((error) => {
        console.error("Error fetching trips:", error);
        setLoading(false);
        });
    }, []);

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

    // Toggle Dark Mode
    const handleToggleDarkMode = () => {
        setDarkMode((prevMode) => !prevMode);
    };

    const authContext = useContext(AuthContext);
    const username = authContext.user?.username || "???";

    // Drive Time
    const [availableDriveTime, setAvailableDriveTime] = useState(0);
    useEffect(() => {
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
    
        fetchTrips();
    }, []);

    return (
    <div className="landing-page">
        {/* Sidebar Navigation */}
        <Sidebar darkMode={darkMode} handleToggleDarkMode={handleToggleDarkMode} />
        

        {/* Dashboard Section */}
        <section className="dashboard">
        <div className="top">
            <i className="uil uil-bars sidebar-toggle"></i>
            <div className="search-box">
            <i className="uil uil-search"></i>
            <input type="text" placeholder="Search trips..." />
            </div>
            <div className="user-profile">
            <span>Welcome {username}</span>
            </div>
        </div>

        {/* Dashboard Overview */}
        <div className="dash-content">
            <div className="overview">
                <div className="title">
                    <i className="uil uil-truck"></i>
                    <span className="text">Trip Details</span>
                </div>
            <div className="boxes">
                <div className="box box1">
                <i className="uil uil-clock"></i>
                <span className="text">Current Cycle Used</span>
                <span className="number" style={{ fontSize: "30px", fontWeight: "normal" }}>0/70 hrs</span>
                </div>
                {/* Display Current Trip */}
                <div className="box box2">
                <i className="uil uil-map-marker"></i>
                <span className="text">Current Trip</span>
                {loading ? (
                    <span className="number">Loading...</span>
                ) : trips.length > 0 ? (
                    trips[trips.length - 1].pickup_location && trips[trips.length - 1].dropoff_location ? (
                    <span className="number" style={{ fontSize: "30px", fontWeight: "normal" }}>{trips[trips.length - 1].pickup_location} → {trips[trips.length - 1].dropoff_location}</span>
                    ) : (
                    <span className="number">Trip data missing</span>
                    )
                ) : (
                    <span className="number">No trips available</span>
                )}
                </div>
                <div className="box box3">
                    <i className="uil uil-schedule"></i>
                    <span className="text">Available Drive Time</span>
                    {loading ? (
                        <span className="number">Loading...</span>
                    ) : (
                        <span className="number" style={{ fontSize: "30px", fontWeight: "normal" }}>
                            {availableDriveTime} hrs
                        </span>
                    )}
                </div>
            </div>
            </div>

            {/* Trip Planner Section */}
            <div className="trip-planner">
            <div className="title">
                <i className="uil uil-route"></i>
                <span className="text">New Trip</span>
            </div>
            <div className="form-container">
                {/* Sidebar Navigation */}
                <TripForm darkMode={darkMode} handleToggleDarkMode={handleToggleDarkMode} />
            </div>
            </div>

        </div>
        </section>
    </div>
    );
};

export default Dashboard;