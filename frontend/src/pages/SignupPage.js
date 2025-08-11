import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SignupPage.css";

const SignupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedFields, setFocusedFields] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFocus = field => {
    setFocusedFields({ ...focusedFields, [field]: true });
  };

  const handleBlur = field => {
    setFocusedFields({ ...focusedFields, [field]: false });
  };

  const validateForm = () => {
    const newErrors = {};
    const { name, email, password, confirmPassword } = formData;

    if (!name.trim()) newErrors.name = "Name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid.";

    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters.";

    if (confirmPassword !== password)
      newErrors.confirmPassword = "Passwords do not match.";

    return newErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const response = await axios.post(
          "https://task-manage-app-ogd7.onrender.com/api/auth/signup",
          {
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }
        );
        console.log(response.data);
        alert("Signup successful! Please log in.");
        navigate("/login");
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Server error occurred.";
        alert("Signup failed: " + errorMessage);
        console.error("Signup error:", err);
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <div className="signup-container">
      <div className="signup-box">
        <div className="logo-section">
          <h1 className="logo">Taskify</h1>
        </div>
        <div className="form-section">
          <h2 className="welcome-text">Welcome</h2>
          <p className="info-text">
            Enter your info to get started with taskify.
          </p>

          <form onSubmit={handleSubmit} className="signup-form">
            {/* Name Field */}
            <div className="input-wrapper">
              <div className="input-container">
                <input
                  type="text"
                  name="name"
                  className={`input-field ${
                    formData.name || focusedFields.name ? "has-value" : ""
                  } ${errors.name ? "error-border" : ""}`}
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => handleFocus("name")}
                  onBlur={() => handleBlur("name")}
                />
                <label
                  className={`floating-label ${
                    formData.name || focusedFields.name ? "focused" : ""
                  }`}
                >
                  Name
                </label>
              </div>
              {/* <div className="error" style={{ opacity: errors.name ? 1 : 0 }}>
                {errors.name || " "}
              </div> */}
            </div>

            {/* Email Field */}
            <div className="input-wrapper">
              <div className="input-container">
                <input
                  type="text"
                  name="email"
                  className={`input-field ${
                    formData.email || focusedFields.email ? "has-value" : ""
                  }`}
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus("email")}
                  onBlur={() => handleBlur("email")}
                />
                <label
                  className={`floating-label ${
                    formData.email || focusedFields.email ? "focused" : ""
                  }`}
                >
                  Email
                </label>
              </div>
              {/* <div className="error" style={{ opacity: errors.email ? 1 : 0 }}>
                {errors.email || " "}
              </div> */}
            </div>

            {/* Password Field */}
            <div className="input-wrapper">
              <div className="input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`input-field ${
                    formData.password || focusedFields.password
                      ? "has-value"
                      : ""
                  }`}
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus("password")}
                  onBlur={() => handleBlur("password")}
                />
                <label
                  className={`floating-label ${
                    formData.password || focusedFields.password ? "focused" : ""
                  }`}
                >
                  Password
                </label>
              </div>
              {/* <div
                className="error"
                style={{ opacity: errors.password ? 1 : 0 }}
              >
                {errors.password || " "}
              </div> */}
            </div>

            {/* Confirm Password Field */}
            <div className="input-wrapper">
              <div className="input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  className={`input-field ${
                    formData.confirmPassword || focusedFields.confirmPassword
                      ? "has-value"
                      : ""
                  }`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => handleFocus("confirmPassword")}
                  onBlur={() => handleBlur("confirmPassword")}
                />
                <label
                  className={`floating-label ${
                    formData.confirmPassword || focusedFields.confirmPassword
                      ? "focused"
                      : ""
                  }`}
                >
                  Confirm Password
                </label>
              </div>
              {/* <div
                className="error"
                style={{ opacity: errors.confirmPassword ? 1 : 0 }}
              >
                {errors.confirmPassword || " "}
              </div> */}
            </div>

            <div className="options-row">
              <label className="show-password">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(prev => !prev)}
                />
                Show password
              </label>
            </div>

            <div className="input-wrapper signup-btn-wrapper">
              <button type="submit" className="signup-btn" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </div>

            <p className="login-link">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")}>Login</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
