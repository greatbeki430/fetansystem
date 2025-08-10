import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiLogOut,
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiClock,
  FiGrid,
} from "react-icons/fi";
import "./TasksPage.css";
import TaskModal from "../components/TaskModal";
import EditTaskModal from "../components/EditTaskModal";

const TasksPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskName, setTaskName] = useState(""); // Separate state for task name
  const [isCreating, setIsCreating] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editTaskStatus, setEditTaskStatus] = useState("pending");

  const location = useLocation();

  // Add the handleEditTask function
  const handleEditTask = taskId => {
    const taskToEdit = tasks.find(task => task._id === taskId);
    if (taskToEdit) {
      setCurrentTask(taskToEdit);
      setEditTaskName(taskToEdit.name);
      setEditTaskStatus(taskToEdit.status || "pending");
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!currentTask || !editTaskName.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:5000/api/tasks/${currentTask._id}`,
        {
          name: editTaskName,
          status: editTaskStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTasks(
        tasks.map(task => (task._id === currentTask._id ? response.data : task))
      );
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating task:", error);
      alert(error.response?.data?.message || "Failed to update task");
    }
  };

  // Wrap fetchUserData in useCallback to memoize it
  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, redirecting to login");
      window.location.href = "/login";
      return;
    }
    try {
      const response = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserName(response.data.name || "Unknown User");
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserName("Guest");
    }
  }, []);

  const handleCreateTask = async () => {
    const token = localStorage.getItem("token");
    setIsCreating(true);

    if (!token) {
      console.error("No token found in localStorage");
      window.location.href = "/login";
      return;
    }

    if (!taskName.trim()) {
      alert("Task name cannot be empty");
      setIsCreating(false);
      return;
    }

    try {
      console.log("Attempting to create task:", taskName);

      const response = await axios.post(
        "http://localhost:5000/api/tasks",
        { name: taskName },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Task creation response:", response.data);

      setTasks(prev => [...prev, response.data]);
      setTaskName("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Full error:", error);

      let errorMessage = "Failed to create task";
      if (error.response) {
        console.error("Error response data:", error.response.data);
        errorMessage = error.response.data.message || errorMessage;

        if (error.response.status === 401) {
          // Token is invalid, redirect to login
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
      }

      alert(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // Wrap fetchTasks in useCallback, add 'search' as dependency since it's used inside
  const fetchTasks = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, redirecting to login");
      window.location.href = "/login";
      return;
    }
    try {
      const response = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
        params: { search },
      });
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, [search]);

  // Add these to your component
  const handleToggleStatus = async taskId => {
    try {
      const token = localStorage.getItem("token");
      const task = tasks.find(t => t._id === taskId);
      const newStatus = task.status === "completed" ? "pending" : "completed";

      await axios.patch(
        `http://localhost:5000/api/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks(
        tasks.map(t => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async taskId => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Call fetchUserData and fetchTasks inside useEffect, add them to dependencies
  useEffect(() => {
    fetchUserData();
    fetchTasks();
  }, [fetchUserData, fetchTasks]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div className="search-wrapper">
          <div className="search-input-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="search-field"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for tasks"
            />
          </div>
        </div>
        <div className="user-section">
          <span className="user-name">{userName}</span>
          <button onClick={handleLogout}>
            <FiLogOut />
          </button>
        </div>
      </div>
      <div className="tasks-content">
        {tasks.length > 0 ? (
          <>
            {/* Modified Add Task Button Section */}
            <div className="add-task-top">
              <button
                className={`dashboard-nav-btn ${
                  location.pathname === "/dashboard" ? "active" : ""
                }`}
                onClick={() => navigate("/dashboard")}
              >
                <FiGrid className="dashboard-icon" />
                <span>Dashboard</span>
              </button>

              <button
                className="top-add-btn"
                onClick={() => setIsModalOpen(true)}
                disabled={isCreating}
                aria-label="Add new task"
              >
                <FiPlus className="add-icon" />
                <span>Add Task</span>
              </button>
            </div>

            <div className="task-list">
              {tasks.map(task => (
                <div className="task-item" key={task._id}>
                  {/* Existing task item content */}
                  <div className="task-content">
                    <div className="task-name-row">
                      <input
                        type="checkbox"
                        className="task-checkbox"
                        checked={task.status === "completed"}
                        onChange={() => handleToggleStatus(task._id)}
                      />
                      <p
                        className={`task-name ${
                          task.status === "completed" ? "completed" : ""
                        }`}
                      >
                        {task.name}
                      </p>
                    </div>
                    {task.createdAt && (
                      <p className="task-date">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="task-actions">
                    {task.status !== "completed" && (
                      <span
                        className={`task-status status-${
                          task.status || "pending"
                        }`}
                      >
                        <FiClock className="status-icon" />
                        {task.status || "pending"}
                      </span>
                    )}
                    <button
                      className="task-button edit"
                      onClick={() => handleEditTask(task._id)}
                      data-tooltip="Edit task"
                    >
                      <FiEdit className="icon" />
                    </button>
                    <button
                      className="task-button delete"
                      onClick={() => handleDeleteTask(task._id)}
                      data-tooltip="Delete task"
                    >
                      <FiTrash2 className="icon" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h2 className="empty-title">No Tasks Yet</h2>
            <p className="empty-description">
              No tasks created yet, You can start by clicking <br /> the add new button
              bellow to create one
            </p>
            <button
              className="add-new-btn"
              onClick={() => setIsModalOpen(true)}
              disabled={isCreating}
            >
              <FiPlus className="add-icon" />
              Add New
            </button>
          </div>
        )}
      </div>
      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateTask}
        taskName={taskName}
        setTaskName={setTaskName}
      />
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        taskName={editTaskName}
        setTaskName={setEditTaskName}
        taskStatus={editTaskStatus}
        setTaskStatus={setEditTaskStatus}
      />
    </div>
  );
};

export default TasksPage;
