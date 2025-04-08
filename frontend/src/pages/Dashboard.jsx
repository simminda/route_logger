import { useEffect, useState } from "react";
import TripMap from "../components/TripMap";
import Layout from "../components/Layout";

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableDriveTime, setAvailableDriveTime] = useState(0);
  const [date, setDate] = useState(""); // New state for date input
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/trips/`);
      const data = await response.json();

      console.log("Fetched trips:", data);
      setTrips(data);

      if (data.length > 0) {
        const latestTrip = data[data.length - 1];
        console.log("Latest trip:", latestTrip);

        const cycleUsed = latestTrip.current_cycle_used ?? 0;
        const available = latestTrip.available_drive_time ?? 70 - cycleUsed;

        console.log("Cycle used:", cycleUsed);
        console.log("Available drive time:", available);

        setAvailableDriveTime(available);
      } else {
        console.log("No trips found. Setting default available drive time.");
        setAvailableDriveTime(70);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      setAvailableDriveTime(70); // Safe fallback
    } finally {
      setLoading(false); // ✅ Always stop loading
    }
  };

  const handleTripAdded = async () => {
    await fetchTrips();
  };

  const latestTripId = trips.length > 0 ? trips[trips.length - 1].id : null;

  const [currentTripId, setCurrentTripId] = useState(null);

  useEffect(() => {
    async function fetchCurrentTrip() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          return;
        }

        const API_URL = import.meta.env.VITE_API_URL; 
        const response = await fetch(`${API_URL}/api/current_trip/`, 
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "Failed to fetch current trip:",
            response.status,
            errorText
          );
          throw new Error(`Failed to fetch current trip: ${response.status}`);
        }

        const data = await response.json();
        setCurrentTripId(data.id);
      } catch (error) {
        console.error("Could not fetch current trip:", error);
      }
    }

    fetchCurrentTrip();
  }, []);

  // Update available drive time after a log is submitted (Backend communication)
  const handleNewLog = async (logData) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found in localStorage");
        return;
      }

      console.log("Submitting ELD log data:", logData);

      const API_URL = import.meta.env.VITE_API_URL; 
      const response = await fetch(`${API_URL}/api/eld_logs/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logData),
      });

      console.log("ELD log POST response status:", response.status);

      const responseData = await response.json();

      console.log("Response data from backend:", responseData);

      if (response.ok) {
        if (responseData.available_drive_time !== undefined) {
          console.log(
            "Setting availableDriveTime to:",
            responseData.available_drive_time
          );
          setAvailableDriveTime(responseData.available_drive_time);
        } else {
          console.warn(
            "available_drive_time not in response — falling back to fetchTrips"
          );
          await fetchTrips();
        }
      } else {
        console.error("Log submission failed:", responseData);
      }
    } catch (error) {
      console.error("Unexpected error in handleNewLog:", error);
    }
  };

  return (
    <Layout>
      <div className="overview">
        <div className="title">
          <i className="uil uil-truck"></i>
          <span className="text">Trip Details</span>
        </div>
        <div className="boxes">
          {/* Current Cycle Used */}
          <div className="box box1">
            <i className="uil uil-clock"></i>
            <span className="text">Current Cycle Used</span>
            {loading ? (
              <span className="number">Loading...</span>
            ) : (
              <span
                className="number"
                style={{ fontSize: "30px", fontWeight: "normal" }}
              >
                {70 - availableDriveTime} / 70 hrs
              </span>
            )}
          </div>

          {/* Current Trip */}
          <div className="box box2">
            <i className="uil uil-map-marker"></i>
            <span className="text">Current Trip</span>
            {loading ? (
              <span className="number">Loading...</span>
            ) : trips.length > 0 ? (
              trips[trips.length - 1].pickup_location &&
              trips[trips.length - 1].dropoff_location ? (
                <span
                  className="number"
                  style={{ fontSize: "24px", fontWeight: "normal" }}
                >
                  {trips[trips.length - 1].pickup_location} →{" "}
                  {trips[trips.length - 1].dropoff_location}
                </span>
              ) : (
                <span className="number">Trip data missing</span>
              )
            ) : (
              <span className="number">No trips available</span>
            )}
          </div>

          {/* Available Drive Time */}
          <div className="box box3">
            <i className="uil uil-schedule"></i>
            <span className="text">Available Drive Time</span>
            {loading ? (
              <span className="number">Loading...</span>
            ) : (
              <span
                className="number"
                style={{ fontSize: "30px", fontWeight: "normal" }}
              >
                {availableDriveTime} hrs
              </span>
            )}
          </div>
        </div>
      </div>

      <br></br>

      {latestTripId && <TripMap tripId={latestTripId} />}
    </Layout>
  );
};

export default Dashboard;
