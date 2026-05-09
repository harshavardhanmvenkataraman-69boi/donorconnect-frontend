import { Modal, Button } from 'react-bootstrap';
export default function ConfirmModal({ show, onHide, onConfirm, title = 'Confirm Action', message = 'Are you sure?' }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body><p className="mb-0">{message}</p></Modal.Body>
      <Modal.Footer>
        <button className="btn-glass" onClick={onHide}>Cancel</button>
        <button className="btn-crimson" onClick={onConfirm}>Confirm</button>
      </Modal.Footer>
    </Modal>
  );
}
