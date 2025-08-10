import axios from "axios";

const API_URL = "https://task-manage-app-ogd7.onrender.com/api/tasks";

// Set up axios instance with auth token
const api = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to include token
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchTasks = async (status, page = 1, limit = 3, search = "") => {
  try {
    // const response = await api.get("/", {
    //   params: {
    //     status,
    //     page,
    //     limit,
    //     search,
    //   },
    // });
    const response = await api.get("/", {
      params: {
        status: status.replace(" ", "_"), // Convert "in progress" to "in_progress"
        page,
        limit,
        search,
      },
    });

    // Handle standardized response
    // ⚠️ Potential Improvement Needed:
    if (response.data.success !== false) {
      // More resilient check
      return {
        tasks: response.data.tasks || [], // Default empty array
        total: response.data.total || 0, // Default 0
      };
    }
    throw new Error(response.data.message || "Failed to fetch tasks");
  } catch (error) {
    console.error("Error fetching tasks:", error);
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const createTask = async taskData => {
  try {
    const response = await api.post("/", taskData);
    return response.data;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId, status) => {
  try {
    const response = await api.patch(`/${taskId}`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const deleteTask = async taskId => {
  try {
    await api.delete(`/${taskId}`);
    return true;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};
