import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

const TripHistory = () => {
  const [tripHistory, setTripHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTripHistory() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://127.0.0.1:8000/api/trip-history/", {
          method: "GET",
          headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch trip history");
        }

        const data = await response.json();
        setTripHistory(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch trip history:", error);
        setLoading(false);
      }
    }

    fetchTripHistory();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="trip-history-container">
        <h1>Trip History</h1>
        {tripHistory.length === 0 ? (
          <p>No trips available.</p>
        ) : (
          <ul className="trip-history-list">
            {tripHistory.map((trip, index) => (
              <li key={index} className="trip-card">
                <h3>
                  {trip.pickup_location} → {trip.dropoff_location}
                </h3>
                <p>
                  <strong>Started:</strong> {new Date(trip.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default TripHistory;
