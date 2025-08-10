
import axios from "axios";

const API_URL = "http://localhost:5000/api/tasks";

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
    const response = await api.get("/", {
      params: {
        status,
        page,
        limit,
        search,
      },
    });
    return {
      tasks: response.data.tasks || response.data,
      total: response.data.total || response.data.length,
    };
  } catch (error) {
    console.error("Error fetching tasks:", error);
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