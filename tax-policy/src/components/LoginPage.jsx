import React, { useState } from "react";
import { validateEmail } from "../utils/validation";
import { api } from "../utils/api";

function LoginPage({ onNavigate, setIsAuthenticated, setUser , isDarkMode}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const bgClass = isDarkMode ? 'bg-green-900' : 'bg-green-100';
  const borderClass = isDarkMode ? 'border-green-700' : 'border-green-300';
  const inputBg = isDarkMode ? 'bg-green-800' : 'bg-green-100';
  const textClass = isDarkMode ? 'bg-green-900' : 'bg-white';


const onLogin = async () => {
  setError("");

  if (!validateEmail(email)) {
    setError("Invalid email format");
    return;
  }

  try {
    const response = await api.post("/login", {
      email,
      password,
    });

    // Save token
    localStorage.setItem("token", response.access_token);

    // Update app state
    setIsAuthenticated(true);
    setUser(response.user);

    onNavigate("home");
  } catch (err) {
    setError(err.message || "Login failed");
  }
};

  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <div className= {`${bgClass} p-8 rounded-lg shadow-lg`}>
        <h2 className={`text-2xl font-bold mb-6 text-center `}>Login</h2>

        <input
          className={`w-full p-3 border ${borderClass} rounded ${inputBg} ${textClass}`}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className={`w-full p-3 border ${borderClass} rounded mt-4 ${inputBg}`}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
        )}

        <button
          onClick={onLogin}
          className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 mt-6"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default LoginPage;

