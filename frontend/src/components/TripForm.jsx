import { useState, useEffect } from "react";

const locations = [
    { name: "Depot (OR Tambo Airport)", lat: -26.1367, lng: 28.2411 },
    { name: "Game Rosebank", lat: -26.1453, lng: 28.0410 },
    { name: "Game Eastgate", lat: -26.1791, lng: 28.1170 },
    { name: "Game Jhb City", lat: -26.2041, lng: 28.0400 },
    { name: "Game Cresta", lat: -26.1348, lng: 27.9655 },
    { name: "Game Festival Mall", lat: -26.1051, lng: 28.2296 },
    { name: "Game Alberton", lat: -26.2673, lng: 28.1222 },
    { name: "Game Mall Of Africa", lat: -25.9981, lng: 28.1077 },
    { name: "Game The Glen", lat: -26.2679, lng: 28.0496 },
    { name: "Game Fourways", lat: -26.0071, lng: 28.0124 },
    { name: "Game Boksburg", lat: -26.2140, lng: 28.2594 },
    { name: "Game Key West", lat: -26.0970, lng: 27.7705 },
    { name: "Game Centurion", lat: -25.8585, lng: 28.1903 },
    { name: "Game Springs", lat: -26.2485, lng: 28.4404 },
    { name: "Game Menlyn", lat: -25.7825, lng: 28.2751 },
    { name: "Game Heidelberg", lat: -26.5011, lng: 28.3585 }
];

const TripForm = ({ tripId }) => {
    const [formData, setFormData] = useState({
        current_location: "",
        pickup_location: "",
        dropoff_location: "",
        current_cycle_used: 0,  // Default value is 0
    });

    useEffect(() => {
        console.log("tripId:", tripId); // Debugging tripId
        if (tripId) {
            const fetchTripData = async () => {
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/trips/${tripId}`);
                    const data = await response.json();
                    console.log("Fetched data:", data); // Debugging fetched data
                    
                    if (data) {
                        setFormData({
                            current_location: data.current_location || "",
                            pickup_location: data.pickup_location || "",
                            dropoff_location: data.dropoff_location || "",
                            current_cycle_used: data.current_cycle_used || 0, // Use existing value
                        });
                    }
                } catch (error) {
                    console.error("Error fetching trip data:", error);
                }
            };

            fetchTripData();
        }
    }, [tripId]); // Dependency on tripId, it will rerun whenever tripId changes

    const getCoordinates = async (address) => {
        const url = `http://127.0.0.1:8000/api/get-coordinates/?address=${encodeURIComponent(address)}`;
    
        try {
            const response = await fetch(url);
            const data = await response.json();
    
            if (data.features?.length > 0) {
                return data.features[0].geometry.coordinates; // [lng, lat]
            }
        } catch {
            return null;
        }
    };
    

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const pickupStore = locations.find(store => store.name === formData.pickup_location);
        const dropoffStore = locations.find(store => store.name === formData.dropoff_location);

        if (!dropoffStore) {
            alert("Please select a valid Dropoff Location.");
            return;
        }

        // If pickupStore is selected from dropdown, use its coords
        // Else fallback to geocoding the text in current_location input
        let startCoords;

        if (pickupStore) {
            startCoords = [pickupStore.lng, pickupStore.lat];
        } else {
            startCoords = await getCoordinates(formData.current_location);
        }

        const dropoffCoords = [dropoffStore.lng, dropoffStore.lat];

        if (!startCoords || !dropoffCoords) {
            alert("Could not get coordinates. Please check locations and try again.");
            return;
        }

        const tripData = {
            current_location: formData.current_location,
            pickup_location: formData.pickup_location || "Current Location",
            dropoff_location: formData.dropoff_location,
            pickup_lat: startCoords[1],
            pickup_lng: startCoords[0],
            dropoff_lat: dropoffCoords[1],
            dropoff_lng: dropoffCoords[0]
        };

        try {
            const response = await fetch("http://127.0.0.1:8000/api/trips/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken(),
                },
                body: JSON.stringify(tripData),
            });

            if (response.ok) {
                alert("Trip submitted successfully!");
            } else {
                throw new Error();
            }
        } catch {
            alert("Failed to submit trip.");
        }
    };

    const getCSRFToken = () => {
        return document.cookie.split("; ").find(row => row.startsWith("csrftoken="))?.split("=")[1] || "";
    };

    return (
        <form onSubmit={handleSubmit} className="trip-form container mt-4 p-4 border rounded shadow">
            <div className="row mb-3">
                <div className="col-md-4">
                    <label className="form-label">Current Location</label>
                    <input
                        type="text"
                        name="current_location"
                        className="form-control"
                        placeholder="Enter current location"
                        value={formData.current_location}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label">Pickup Location</label>
                    <select name="pickup_location" className="form-control" value={formData.pickup_location} onChange={handleChange}>
                        <option value="">Select a Pickup Location (Optional)</option>
                        {locations.map((store, index) => (
                            <option key={index} value={store.name}>{store.name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-4">
                    <label className="form-label">Dropoff Location</label>
                    <select name="dropoff_location" className="form-control" value={formData.dropoff_location} onChange={handleChange} required>
                        <option value="">Select a Dropoff Location</option>
                        {locations.map((store, index) => (
                            <option key={index} value={store.name}>{store.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label">Current Cycle Used (Hours)</label>
                    <input
                        type="number"
                        name="current_cycle_used"
                        className="form-control"
                        min="0"
                        max="70"
                        value={formData.current_cycle_used}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-md-6 d-flex align-items-end">
                    <button type="submit" className="btn btn-primary w-100">
                        Generate Route & Logs
                    </button>
                </div>
            </div>
        </form>
    );
};

export default TripForm;
