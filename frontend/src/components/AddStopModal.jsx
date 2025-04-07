import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

// Predefined list of Keyfleet stops
const keyfleetStops = [
  { name: "Africa Truck Stop @ R23 (Brakpan)", lat: -26.3085, lng: 28.3664 },
  { name: "Gauteng Truck Stop (Wadeville)", lat: -26.2723, lng: 28.1613 },
  { name: "Africa Truckstop (Kempton Park)", lat: -26.0916, lng: 28.2581 },
  { name: "Northrand Fuel Depot (Boksburg)", lat: -26.2032, lng: 28.2593 },
  { name: "Edge Fuels Boksburg", lat: -26.2165, lng: 28.2612 },
  { name: "HMI Service Station (Germiston)", lat: -26.2282, lng: 28.1629 },
  { name: "BDN Diesel (Alrode South)", lat: -26.332, lng: 28.1228 },
  { name: "Isomaster PTY LTD (Midrand)", lat: -25.9441, lng: 28.1432 },
  { name: "Gaspet MK Depot (Pretoria)", lat: -25.8671, lng: 28.2423 },
  { name: "Zambesi Truckstop (Pretoria North)", lat: -25.5736, lng: 28.3671 },
  { name: "Turquoise Moon (Randfontein)", lat: -26.1742, lng: 27.6926 },
];

const AddStopModal = ({ onClose, tripId, onAddStop, show }) => {
  const [selectedStop, setSelectedStop] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStop || lat === null || lng === null) {
      alert("Please select a stop and time.");
      return;
    }

    const newStop = {
      location: selectedStop,
      lat,
      lng,
      tripId,
    };

    await onAddStop(newStop);
    onClose();
  };

  const handleStopChange = (e) => {
    const selectedName = e.target.value;
    const stop = keyfleetStops.find((s) => s.name === selectedName);
    if (stop) {
      setSelectedStop(stop.name);
      setLat(stop.lat);
      setLng(stop.lng);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add a Stop</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Stop Location:</Form.Label>
            <Form.Select
              value={selectedStop}
              onChange={handleStopChange}
              required
            >
              <option value="">Select a Keyfleet Stop...</option>
              {keyfleetStops.map((stop, index) => (
                <option key={index} value={stop.name}>
                  {stop.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <div className="d-flex justify-content-between">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Stop
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddStopModal;
