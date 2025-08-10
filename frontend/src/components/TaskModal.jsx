import React from "react";
import "./TaskModal.css";

const TaskModal = ({
  isOpen,
  onClose,
  onCreate,
  taskName,
  setTaskName,
  isCreating,
}) => {
  if (!isOpen) return null;

  const handleCreate = () => {
    onCreate();
  };

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-content-box">
          <h2>Create New Task</h2>
          <p>
            Organize your productivity effortlessly by creating a new task. Name
            it whatever helps you stay on top of your game!
          </p>
          <div className="task-modal-input-group">
            <input
              type="text"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              placeholder="Task name"
              disabled={isCreating}
            />
            <button
              onClick={handleCreate}
              disabled={isCreating || !taskName.trim()}
            >
              {isCreating ? "Creating..." : "Create Task"}
            </button>
          </div>
        </div>
        <button className="close-modal" onClick={onClose} disabled={isCreating}>
          ×
        </button>
      </div>
    </div>
  );
};

export default TaskModal;
