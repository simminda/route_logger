import React from "react";
import { Modal } from "react-bootstrap";
import TripForm from "./TripForm";

const TripModal = ({ show, handleClose }) => {
  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>New Trip</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TripForm onClose={handleClose} />
      </Modal.Body>
    </Modal>
  );
};

export default TripModal;
