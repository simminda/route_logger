import { useState, useContext, useEffect } from "react";
import Sidebar from "./Sidebar";
import AuthContext from "../context/AuthContext";
import SearchResults from "./SearchResults";
import ELDLogModal from "../components/ELDLogModal";
import TripModal from "../components/TripModal"; 

const Layout = ({ children }) => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem("mode") === "dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalShow, setModalShow] = useState(false);
  const [tripModalShow, setTripModalShow] = useState(false); 
  const [tripId, setTripId] = useState(null);
  const [date, setDate] = useState("");

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("mode", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("mode", "light");
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const authContext = useContext(AuthContext);
  const username = authContext.user?.username || "???";

  const handleModalOpen = () => setModalShow(true);
  const handleModalClose = () => {
    setModalShow(false);
    window.location.reload();
  };
  const handleTripModalOpen = () => setTripModalShow(true); 
  const handleTripModalClose = () => {
    setTripModalShow(false);
    window.location.reload();
  };

  // New function to submit the log data to the API
  const API_URL = import.meta.env.VITE_API_URL;

  const submitLogData = async (logData) => {
    try {
      const response = await fetch(`${API_URL}/api/eld_logs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const onLogSubmit = async (logData) => {
    try {
      // Process your form submission
      await submitLogData(logData);
      
      // Close modal and refresh page
      setModalShow(false);
      window.location.reload();
    } catch (error) {
      console.error("Error submitting log:", error);
    }
  };

  return (
    <div className="landing-page">
      <Sidebar darkMode={darkMode} handleToggleDarkMode={handleToggleDarkMode} />

      <section className="dashboard">
        <div className="top">
          <button
            onClick={handleModalOpen}
            style={{
              backgroundColor: "#007bff",
              border: "none",
              borderRadius: "20px",
              padding: "8px 16px",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              marginRight: "12px"
            }}
          >
            Add ELD Log
          </button>

          <button
            onClick={handleTripModalOpen}
            style={{
              backgroundColor: "#28a745",
              border: "none",
              borderRadius: "20px",
              padding: "8px 16px",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              marginRight: "16px"
            }}
          >
            + New Trip
          </button>

          <div className="search-box">
            <i className="uil uil-search"></i>
            <input
              type="text"
              placeholder="Search trips or logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="user-profile">
            <span>Welcome {username}</span>
          </div>
        </div>

        <div className="dash-content">
          {searchQuery ? (
            <SearchResults searchQuery={searchQuery} />
          ) : (
            children
          )}
        </div>
      </section>

      <ELDLogModal
        show={modalShow}
        handleClose={handleModalClose}
        onLogSubmit={onLogSubmit}
        tripId={tripId}
        date={date}
        setDate={setDate}
      />

      <TripModal
        show={tripModalShow}
        handleClose={handleTripModalClose}
      />
    </div>
  );
};

export default Layout;