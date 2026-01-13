// import React, { useState } from "react";
// import { validateEmail } from "../utils/validation";
// import { api } from "../utils/api";

// function LoginPage({ onNavigate, setIsAuthenticated, setUser , isDarkMode}) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const bgClass = isDarkMode ? 'bg-green-900' : 'bg-green-100';
//   const borderClass = isDarkMode ? 'border-green-700' : 'border-green-300';
//   const inputBg = isDarkMode ? 'bg-green-800' : 'bg-green-100';
//   const textClass = isDarkMode ? 'bg-green-900' : 'bg-white';


// const onLogin = async () => {
//   setError("");

//   if (!validateEmail(email)) {
//     setError("Invalid email format");
//     return;
//   }

//   try {
//     const response = await api.post("/login", {
//       email,
//       password,
//     });

//     // Save token
//     localStorage.setItem("token", response.access_token);

//     // Update app state
//     setIsAuthenticated(true);
//     setUser(response.user);

//      // onNavigate("home");
//     onNavigate("/");  // This will go to the main chat/landing page
//   } catch (err) {
//     setError(err.message || "Login failed");
//   }
// };

//   return (
//     <div className="max-w-md mx-auto mt-20 px-4">
//       <div className= {`${bgClass} p-8 rounded-lg shadow-lg`}>
//         <h2 className={`text-2xl font-bold mb-6 text-center `}>Login</h2>

//         <input
//           className={`w-full p-3 border ${borderClass} rounded ${inputBg} ${textClass}`}
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <input
//           className={`w-full p-3 border ${borderClass} rounded mt-4 ${inputBg}`}
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         {error && (
//           <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
//         )}

//         <button
//           onClick={onLogin}
//           className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 mt-6"
//         >
//           Login
//         </button>
//       </div>
//     </div>
//   );
// }

// export default LoginPage;


import React, { useState } from "react";
import { api } from "../utils/api"; // Uses Vite proxy → calls /api/login

function LoginPage({
  onNavigate,
  setIsAuthenticated,
  setUser,
  isDarkMode,
  onNewChat // ← Add this prop from App.jsx
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-50 border-green-200';
  const inputClass = isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-green-300';

  const onLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.token); // Note: your backend returns "token", not "access_token"

      setIsAuthenticated(true);
      setUser({ email });

      onNewChat(); // This starts a chat so no blank page
      onNavigate("home");

    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${bgClass}`}>
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl border ${cardClass}`}>
        <h2 className="text-3xl font-bold text-center mb-8 text-green-600">
          Welcome Back
        </h2>

        <div className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-5 py-4 rounded-xl border ${inputClass} focus:outline-none focus:ring-4 focus:ring-green-500`}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onLogin()}
            className={`w-full px-5 py-4 rounded-xl border ${inputClass} focus:outline-none focus:ring-4 focus:ring-green-500`}
            disabled={loading}
          />

          {error && (
            <p className="text-red-500 text-center font-medium">{error}</p>
          )}

          <button
            onClick={onLogin}
            disabled={loading}
            className="
              w-full
              py-4
              bg-green-600
              hover:bg-green-700
              text-white
              font-bold
              rounded-xl
              transition-all
              disabled:opacity-60
              shadow-lg
              hover:shadow-xl
            "
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Don't have an account?{" "}
            <button
              onClick={() => onNavigate("signup")}
              className="text-green-600 font-semibold hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;