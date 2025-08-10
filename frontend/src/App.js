import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TasksPage from "./pages/TasksPage";
import SignupPage from "./pages/SignupPage";
import TaskDashboard from "./components/TaskDashboard"; 


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<TaskDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
