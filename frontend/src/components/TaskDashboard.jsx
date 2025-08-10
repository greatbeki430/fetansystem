import React, { useState, useEffect } from "react";
import { FiTrash2, FiPlus, FiSearch, FiLogOut, FiCheck } from "react-icons/fi";
import {
  fetchTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
} from "./api/apiService";
import TaskModal from "./TaskModal";
import "./TaskDashboard.css";

const TaskDashboard = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [userName, setUserName] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userName,
    email: "",
    profilePicture: null,
    previewImage: "",
  });
  const TASKS_PER_PAGE = 3;
  const totalPages = Math.ceil(totalTasks / TASKS_PER_PAGE);

  const handleLogoutConfirm = () => {
    localStorage.removeItem("token");
    showNotification("Logged out successfully!");
    setTimeout(() => {
      window.location.href = "/";
    }, 1000); // Redirect after 1 second to show notification
  };

  const loadTasks = async (page = currentPage) => {
    setLoading(true);
    try {
      const status =
        activeTab === "active" ? "pending,in_progress" : "completed";
      console.log("Fetching tasks with:", {
        status,
        page,
        limit: TASKS_PER_PAGE,
        searchQuery,
      });
      const { tasks, total } = await fetchTasks(
        status,
        page,
        TASKS_PER_PAGE,
        searchQuery
      );
      console.log("Fetched tasks:", tasks, "Total:", total);
      setTasks(tasks);
      setTotalTasks(total);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [activeTab, currentPage, searchQuery]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, redirecting to login");
        window.location.href = "/login";
        return;
      }
      try {
        const response = await fetch("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUserName(data.name || "Unknown User");
          fetchUserProfile(); // Calling the profile fetch function
        } else {
          console.error("Failed to fetch user data:", response.status);
          setUserName("Guest");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserName("Guest");
      }
    };
    fetchUserData();
  }, []);

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success", // 'success' or 'error'
  });

  // Function to show notification
  const showNotification = (message, type = "success") => {
    setNotification({
      show: true,
      message,
      type,
    });

    // Hide after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleDelete = taskId => {
    setTaskToDelete(taskId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.toLowerCase() === "delete") {
      try {
        await deleteTask(taskToDelete);
        const newTotal = totalTasks - 1;
        const newPage =
          Math.min(currentPage, Math.ceil(newTotal / TASKS_PER_PAGE)) || 1;
        await loadTasks(newPage);
        setShowDeleteModal(false);
        setDeleteConfirmation("");
        showNotification("Task deleted successfully!");
      } catch (error) {
        console.error("Failed to delete task:", error);
        showNotification("Failed to delete task", "error");
      }
    }
  };

  const handleCreateTask = async () => {
    setIsCreating(true);
    try {
      console.log("Attempting to create task:", newTaskName);
      await createTask({ name: newTaskName });
      await loadTasks(1); // Reset to page 1 to show new task
      setNewTaskName("");
      setIsModalOpen(false);
      showNotification("Task created successfully!"); // Add this line
    } catch (error) {
      console.error("Full error creating task:", error);
      let errorMessage = "Failed to create task";
      if (error.response) {
        console.error(
          "Error response:",
          error.response.data,
          "Status:",
          error.response.status
        );
        errorMessage = error.response.data.message || errorMessage;
        if (error.response.status === 401) {
          console.error("Unauthorized, redirecting to login");
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        errorMessage = "No response from server";
      } else {
        console.error("Error setting up request:", error.message);
      }
      alert(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      await loadTasks(currentPage); // Refresh tasks on current page
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const handleProfilePictureChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({
          ...profileData,
          profilePicture: file,
          previewImage: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      // First get basic user info
      const userResponse = await fetch(
        "http://localhost:5000/api/auth/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserName(userData.name);

        // Then get full profile with picture if available
        const profileResponse = await fetch(
          "http://localhost:5000/api/user/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          // setProfileData({
          //   name: profileData.name || userData.name,
          //   email: profileData.email || userData.email,
          //   previewImage: profileData.profilePicture
          //     ? `http://localhost:5000${profileData.profilePicture}`
          //     : "",
          // });
          setProfileData({
            name: userData.name,
            email: userData.email,
            previewImage: userData.profilePicture
              ? `http://localhost:5000${userData.profilePicture}`
              : "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("name", profileData.name);
      formData.append("email", profileData.email);

      if (profileData.profilePicture) {
        formData.append("profilePicture", profileData.profilePicture);
      }

      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type header for FormData - browser will set it automatically
        },
        body: formData,
      });

      const data = await response.json(); // Always parse JSON first

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setUserName(data.user.name);
      showNotification("Profile updated successfully!");
      setShowProfileModal(false);
      fetchUserProfile();
      setIsUpdating(true);
    } catch (error) {
      setIsUpdating(false);
      console.error("Profile update error:", error);
      showNotification(error.message || "Failed to update profile", "error");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="tasks-header">
        <div className="search-wrapper">
          <div className="search-input-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="search-field"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for tasks"
            />
          </div>
        </div>
        {/* <div className="user-section">
          <span className="user-name">{userName}</span>
          <button
            // onClick={handleLogout}
            onClick={() => setShowLogoutModal(true)}
          >
            <FiLogOut />
          </button>
        </div> */}
        <div
          className="user-section"
          onClick={() => setShowProfileModal(true)}
          style={{ cursor: "pointer" }}
        >
          {profileData.previewImage ? (
            <img
              src={profileData.previewImage}
              alt="Profile"
              className="profile-image"
            />
          ) : (
            <div className="profile-initial">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="user-name">{userName}</span>
          <button
            onClick={e => {
              e.stopPropagation();
              setShowLogoutModal(true);
            }}
          >
            <FiLogOut />
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="tabs-container">
          <div className="tabs">
            <button
              className={activeTab === "active" ? "db-tab-active" : ""}
              onClick={() => {
                setActiveTab("active");
                setCurrentPage(1);
              }}
            >
              Pending
            </button>
            <button
              className={activeTab === "completed" ? "db-tab-active" : ""}
              onClick={() => {
                setActiveTab("completed");
                setCurrentPage(1);
              }}
            >
              Completed
            </button>
          </div>
        </div>
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            You've got {totalTasks} tasks today
          </h1>
          <button
            className="add-new-btn"
            onClick={() => setIsModalOpen(true)}
            disabled={isCreating}
            aria-label="Add new task"
          >
            <FiPlus /> Add New
          </button>
        </div>

        <div className="task-section-container">
          <h2 className="section-title">
            {activeTab === "active" ? "On Hold" : "Completed"}
          </h2>

          {loading ? (
            <div className="loading">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">No tasks found</div>
          ) : (
            <div className="task-list">
              {tasks.map(task => (
                <div key={task._id} className="task-card">
                  <div className="task-dot"></div>
                  <span className="task-name">{task.name}</span>
                  <div className="task-status">
                    <select
                      className={`status-dropdown ${task.status || "pending"}`}
                      value={task.status || "pending"}
                      onChange={e =>
                        handleStatusChange(task._id, e.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <button
                    className="task-delete-btn"
                    onClick={() => handleDelete(task._id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pagination">
          <span className="pagination-info">
            Showing {(currentPage - 1) * TASKS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * TASKS_PER_PAGE, totalTasks)} of {totalTasks}{" "}
            entries
          </span>
          <div className="pagination-controls">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={currentPage === i + 1 ? "db-page-active" : ""}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div
          className="db-modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-content-box">
              <h3 className="db-modal-title">Delete Task</h3>
              <p className="db-modal-text">
                This action can't be undone. Enter the word "delete" in the
                given field below to delete task.
              </p>
              <div className="db-modal-input-group">
                <input
                  type="text"
                  className="db-modal-input"
                  placeholder="Type delete in here"
                  value={deleteConfirmation}
                  onChange={e => setDeleteConfirmation(e.target.value)}
                />
                <button
                  className="db-confirm-delete-btn"
                  onClick={confirmDelete}
                  disabled={deleteConfirmation.toLowerCase() !== "delete"}
                >
                  Delete Task
                </button>
              </div>
            </div>
            <button
              className="close-modal"
              onClick={() => setShowDeleteModal(false)}
              disabled={false}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {notification.show && (
        <div className={`db-success-notification ${notification.type}`}>
          <FiCheck />
          {notification.message}
        </div>
      )}

      {showLogoutModal && (
        <div
          className="db-modal-overlay"
          onClick={() => setShowLogoutModal(false)}
        >
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-content-box">
              <h3 className="db-modal-title">Confirm Logout</h3>
              <p className="db-modal-text">Are you sure you want to log out?</p>
              <div className="db-modal-button-group">
                <button
                  className="db-cancel-btn"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="db-confirm-btn"
                  onClick={handleLogoutConfirm}
                >
                  Log Out
                </button>
              </div>
            </div>
            <button
              className="close-modal"
              onClick={() => setShowLogoutModal(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div
          className="profile-modal-overlay"
          onClick={() => setShowProfileModal(false)}
        >
          <div className="profile-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-content-box">
              <h3>Edit Profile</h3>

              <div className="profile-picture-container">
                <div className="profile-picture-preview">
                  {profileData.previewImage ? (
                    <img src={profileData.previewImage} alt="Profile preview" />
                  ) : (
                    <div className="profile-picture-placeholder">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <label className="upload-btn">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={e =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={e =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowProfileModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="save-btn"
                  onClick={handleProfileUpdate}
                  disabled={isCreating || !profileData.name.trim()}
                >
                  {isCreating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNewTaskName("");
        }}
        onCreate={handleCreateTask}
        taskName={newTaskName}
        setTaskName={setNewTaskName}
        isCreating={isCreating}
      />
    </div>
  );
};

export default TaskDashboard;
