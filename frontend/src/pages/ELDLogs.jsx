import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import ELDLogChart from "../components/ELDLogChart";

const ELDLogs = () => {
  // State variables
  const [currentTripId, setCurrentTripId] = useState(null);
  const [date, setDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch current trip when component mounts
  useEffect(() => {
    fetchCurrentTrip();
  }, []);
  
  // Function to fetch the current trip
  const fetchCurrentTrip = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No token found");
        setIsLoading(false);
        return;
      }

      // Replace local URL with the production API URL
      const API_URL = import.meta.env.VITE_API_URL;  
      const response = await fetch(`${API_URL}/api/current_trip/`, {
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn("Failed to fetch current trip:", response.status);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (data && data.id) {
        setCurrentTripId(data.id);
      }
    } catch (error) {
      console.error("Could not fetch current trip:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for form submission
  const handleNewLog = async (logData) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        return;
      }

      // Replace local URL with the production API URL
      const API_URL = import.meta.env.VITE_API_URL;  // Ensure this environment variable is set in your project
      const response = await fetch(`${API_URL}/api/eld_logs/`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        console.error("Failed to submit log:", response.status);
        return;
      }

      const result = await response.json();
      console.log("Log submitted successfully:", result);
      
      // Optional: Refresh the chart data or perform any other actions after successful submission
      if (typeof window !== 'undefined' && window.ELDLogChart && window.ELDLogChart.refreshData) {
        window.ELDLogChart.refreshData();
      }
      
    } catch (error) {
      console.error("Error submitting log:", error);
    }
  };

  return (
    <Layout>
      <div className="trip-history-container">
        <br></br>
        
        <div className="chart-container" style={{ marginTop: "20px" }}>
          <ELDLogChart />
        </div>
      </div>
    </Layout>
  );
};

export default ELDLogs;
