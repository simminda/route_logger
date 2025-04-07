import React from 'react';
import { Modal } from 'react-bootstrap'; 
import ELDLogForm from "../components/ELDLogForm";

const ELDLogModal = ({ show, handleClose, onLogSubmit, tripId, date, setDate }) => {
  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>ELD Log</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ELDLogForm 
          onLogSubmit={onLogSubmit} 
          tripId={tripId} 
          date={date} 
          setDate={setDate} 
        />
      </Modal.Body>
    </Modal>
  );
};

export default ELDLogModal;
