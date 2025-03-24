import { useState } from "react";

const TripForm = () => {
    const [formData, setFormData] = useState({
        current_location: "",
        pickup_location: "",
        dropoff_location: "",
        current_cycle_used: "", 
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://127.0.0.1:8000/api/trips/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
    
            if (!response.ok) {
                throw new Error("Failed to create trip");
            }
    
            const newTrip = await response.json();
            console.log("Trip Created:", newTrip);
    
            // Update state immediately after creation
            setTrips((prevTrips) => [...prevTrips, newTrip]);
    
            alert("Trip created successfully!");
        } catch (error) {
            console.error("Error creating trip:", error);
            alert("Failed to create trip.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="trip-form container mt-4 p-4 border rounded shadow">
            <div className="row mb-3">
                <div className="col-md-4">
                    <label className="form-label">Current Location</label>
                    <input type="text" name="current_location" className="form-control" placeholder="Enter current location" value={formData.current_location} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                    <label className="form-label">Pickup Location</label>
                    <input type="text" name="pickup_location" className="form-control" placeholder="Enter pickup location" value={formData.pickup_location} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                    <label className="form-label">Dropoff Location</label>
                    <input type="text" name="dropoff_location" className="form-control" placeholder="Enter dropoff location" value={formData.dropoff_location} onChange={handleChange} required />
                </div>
            </div>

            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label">Current Cycle Used (Hours)</label>
                    <input type="number" name="current_cycle_used" className="form-control" min="0" max="70" value={formData.current_cycle_used} onChange={handleChange} required />
                </div>
                <div className="col-md-6 d-flex align-items-end">
                    <button type="submit" className="btn btn-primary w-100">
                        <i className="uil uil-process"></i> Generate Route & Logs
                    </button>
                </div>
            </div>
        </form>
    );
};

export default TripForm;
