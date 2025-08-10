import React from "react";
import "./EditTaskModal.css"; // We'll create this CSS file

const EditTaskModal = ({
  isOpen,
  onClose,
  onSave,
  taskName,
  setTaskName,
  taskStatus,
  setTaskStatus,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-content-box">
          <h2>Edit Task</h2>
          <div className="modal-input-group">
            <input
              type="text"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              placeholder="Task name"
            />
            <select
              value={taskStatus}
              onChange={e => setTaskStatus(e.target.value)}
              className="status-select"
            >
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <button onClick={onSave}>Save Changes</button>
          </div>
        </div>
        <button className="close-modal" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default EditTaskModal;
