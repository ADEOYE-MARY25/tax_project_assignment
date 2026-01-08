import React, { useEffect, useState } from "react";
import {
  validateEmail,
  validatePassword,
  passwordStrength,
} from "../utils/validation";
import { api } from "../utils/api";
function SignupPage({ onNavigate, isDarkMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const bgClass = isDarkMode ? 'bg-green-900' : 'bg-green-100';
  const borderClass = isDarkMode ? 'border-green-700' : 'border-green-300';
  const inputBg = isDarkMode ? 'bg-green-800' : 'bg-green-100';
  const textClass = isDarkMode ? 'bg-green-900' : 'bg-white';
  /* LIVE EMAIL VALIDATION */
  useEffect(() => {
    if (!email) {
      setEmailError("Email is required");
    } else if (!validateEmail(email)) {
      setEmailError("Enter a valid email address");
    } else {
      setEmailError("");
    }
  }, [email]);

  /*  LIVE PASSWORD VALIDATION */
  useEffect(() => {
    if (!password) {
      setPasswordError("Password is required");
    } else if (!validatePassword(password)) {
      setPasswordError(
        "Min 8 chars, uppercase, lowercase and number required"
      );
    } else {
      setPasswordError("");
    }
  }, [password]);

  /* ENABLE BUTTON ONLY WHEN VALID */
  useEffect(() => {
    setCanSubmit(!emailError && !passwordError && email && password);
  }, [emailError, passwordError, email, password]);

  const strength = passwordStrength(password);

const onSignup = async () => {
  try {
    await api.post("/register", {
      email,
      password,
    });

    onNavigate("login");
  } catch (err) {
    setEmailError(err.message || "Signup failed");
  }
};

  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <div className={`${bgClass} p-8 rounded-lg shadow-lg`}>
        <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>

        {/* EMAIL */}
        <input
          className={`w-full p-3 border ${borderClass} rounded ${inputBg} ${textClass}`}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailError && (
          <p className="text-red-600 text-sm mt-1">{emailError}</p>
        )}

        {/* PASSWORD */}
        <input
          className={`w-full p-3 border ${borderClass} rounded mt-4 ${inputBg}`}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {passwordError && (
          <p className="text-red-600 text-sm mt-1">{passwordError}</p>
        )}

        {/* PASSWORD STRENGTH */}
        {password && (
          <div className="mt-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className={`h-2 flex-1 rounded ${
                    strength >= n
                      ? strength <= 2
                        ? "bg-red-500"
                        : strength === 3
                        ? "bg-yellow-500"
                        : "bg-green-600"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs mt-1 ${isDarkMode?"text-green-300":"text-green-600"}`}>
              {strength <= 2 && "Weak"}
              {strength === 3 && "Medium"}
              {strength === 4 && "Strong"}
            </p>
          </div>
        )}

        <button
          disabled={!canSubmit}
          onClick={onSignup}
          className={`w-full p-3 rounded mt-6 text-white ${
            canSubmit
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Create Account
        </button>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <button
            onClick={() => onNavigate("login")}
            className="text-green-600 font-medium"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
