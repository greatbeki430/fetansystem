import React, { useState } from "react";
import "./LoginPage.css";
import axios from "axios"; // Install with: npm install axios
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = async e => {
    e.preventDefault();

    setEmailError("");
    setPasswordError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    try {
      const response = await axios.post(
        "https://task-manage-app-ogd7.onrender.com/api/auth/login",
        {
          email,
          password,
        }
      );

      const { token } = response.data;
      localStorage.setItem("token", token); // Store token for auth
      console.log("Generated token:", token);

      alert("Login successful!");
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setEmailFocused(false);
      setPasswordFocused(false);
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.message || "Server error"));
    }
  };

  const handleSignupRedirect = () => {
    navigate("/signup"); // Use navigate for internal routing to signup page
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-section">
          <h1 className="logo">Taskify</h1>
        </div>
        <div className="form-section">
          <h2 className="welcome-text">Welcome back</h2>
          <p className="info-text">Enter your credentials to continue</p>

          <div className="form-group">
            <div className="input-wrapper">
              <div className="input-container">
                <input
                  type="text"
                  className={`input-field ${
                    email || emailFocused ? "has-value" : ""
                  }`}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
                <label
                  className={`floating-label ${
                    email || emailFocused ? "focused" : ""
                  }`}
                >
                  Username or email
                </label>
              </div>
              {emailError && <p className="error-text">{emailError}</p>}
            </div>

            <div className="input-wrapper">
              <div className="input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input-field ${
                    password || passwordFocused ? "has-value" : ""
                  }`}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <label
                  className={`floating-label ${
                    password || passwordFocused ? "focused" : ""
                  }`}
                >
                  Password
                </label>
              </div>
              <div className="toggle-row">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(prev => !prev)}
                  />
                  <span style={{ marginLeft: "0.4rem" }}>Show password</span>
                </label>
                <a href="/forgot-password" className="forgot-password">
                  Forgot password?
                </a>
              </div>
              {passwordError && <p className="error-text">{passwordError}</p>}
            </div>
          </div>

          <div className="input-wrapper">
            <button className="login-btn" onClick={handleLogin}>
              Log in
            </button>
          </div>

          <p className="signup-text">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="signup-link"
              onClick={handleSignupRedirect}
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
