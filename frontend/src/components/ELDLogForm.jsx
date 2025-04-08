import { useState, useEffect } from "react";

const ELDLogForm = ({ onLogSubmit, tripId = null, date, setDate }) => {
  const [status, setStatus] = useState("Off Duty");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedTrip, setSelectedTrip] = useState(tripId || "");
  const [currentTrip, setCurrentTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch trip details when tripId or selectedTrip changes
  useEffect(() => {
    if (tripId) {
      // Explicit tripId passed via props
      fetchTripDetails(tripId);
    } else {
      // No tripId passed, fetch current trip from API
      fetchCurrentTrip();
    }
  }, []); // ✅ Only run on mount
  
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchTripDetails = (id) => {
    setIsLoading(true);
    setError(null);

    fetch(`${API_URL}/api/trips/${id}/`, {
      method: "GET",
      headers: {
        "Authorization": `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setCurrentTrip(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.warn("Error fetching trip details:", error);
        setIsLoading(false);
      });
  };

  const fetchCurrentTrip = () => {
    setIsLoading(true);
    setError(null);

    fetch(`${API_URL}/api/current_trip/`, {
      method: "GET",
      headers: {
        "Authorization": `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.id) {
          setCurrentTrip(data);
          setSelectedTrip(data.id);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.warn("No current trip available:", error);
        setIsLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!startTime || !endTime || !date) {
      alert("Please fill in all required fields");
      return;
    }

    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = `${date}T${endTime}:00`;

    const statusMap = {
      "Off Duty": 0,
      "Sleeper Berth": 1,
      "Driving": 2,
      "On Duty (Not Driving)": 3,
    };

    const statusInt = statusMap[status];

    // Calculate hours between start and end time
    const hours = Math.abs(new Date(endDateTime) - new Date(startDateTime)) / 36e5;

    const payload = {
      status: statusInt,
      start_time: startDateTime,
      end_time: endDateTime,
      trip_id: selectedTrip || null, // This can be null for non-driving activities
      hours: hours,
    };

    // Use the onLogSubmit function from props instead of making another fetch
    onLogSubmit(payload);

    // Reset form fields after submission
    setStatus("Off Duty");
    setStartTime("");
    setEndTime("");
    setDate("");
    // Don't reset selectedTrip - keep context for the next log
  };

  // Helper to format trip display information
  const formatTripInfo = (trip) => {
    if (!trip) return "";
    return trip.pickup_location && trip.dropoff_location 
      ? `${trip.pickup_location} → ${trip.dropoff_location}`
      : `Trip #${trip.id}`;
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-3 border rounded bg-light">
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option>Off Duty</option>
            <option>Sleeper Berth</option>
            <option>Driving</option>
            <option>On Duty (Not Driving)</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Start Time</label>
          <input
            type="time"
            className="form-control"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">End Time</label>
          <input
            type="time"
            className="form-control"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="row mb-3">
        <div className="col-12">
          <label className="form-label">
            Trip <small className="text-muted">(Optional)</small>
          </label>
          {isLoading ? (
            <div className="d-flex align-items-center">
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <span>Loading trip details...</span>
            </div>
          ) : (
            <select
              className="form-select"
              value={selectedTrip}
              onChange={(e) => setSelectedTrip(e.target.value)}
            >
              <option value="">No Trip (Off-duty or non-driving activity)</option>
              {currentTrip && (
                <option value={currentTrip.id}>
                  Current Trip: {formatTripInfo(currentTrip)}
                </option>
              )}
            </select>
          )}
        </div>
      </div>

      <div className="d-grid">
        <button type="submit" className="btn btn-primary">
          Submit Log
        </button>
      </div>
    </form>
  );
};

export default ELDLogForm;
