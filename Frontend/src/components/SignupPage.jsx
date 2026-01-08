// import React, { useEffect, useState } from "react";
// import {
//   validateEmail,
//   validatePassword,
//   passwordStrength,
// } from "../utils/validation";
// import { api } from "../utils/api";
// function SignupPage({ onNavigate, isDarkMode }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const [canSubmit, setCanSubmit] = useState(false);
//   const bgClass = isDarkMode ? 'bg-green-900' : 'bg-green-100';
//   const borderClass = isDarkMode ? 'border-green-700' : 'border-green-300';
//   const inputBg = isDarkMode ? 'bg-green-800' : 'bg-green-100';
//   const textClass = isDarkMode ? 'bg-green-900' : 'bg-white';
//   /* LIVE EMAIL VALIDATION */
//   useEffect(() => {
//     if (!email) {
//       setEmailError("Email is required");
//     } else if (!validateEmail(email)) {
//       setEmailError("Enter a valid email address");
//     } else {
//       setEmailError("");
//     }
//   }, [email]);

//   /*  LIVE PASSWORD VALIDATION */
//   useEffect(() => {
//     if (!password) {
//       setPasswordError("Password is required");
//     } else if (!validatePassword(password)) {
//       setPasswordError(
//         "Min 8 chars, uppercase, lowercase and number required"
//       );
//     } else {
//       setPasswordError("");
//     }
//   }, [password]);

//   /* ENABLE BUTTON ONLY WHEN VALID */
//   useEffect(() => {
//     setCanSubmit(!emailError && !passwordError && email && password);
//   }, [emailError, passwordError, email, password]);

//   const strength = passwordStrength(password);

// const onSignup = async () => {
//   try {
//     await api.post("/register", {
//       email,
//       password,
//     });

//     onNavigate("login");
//   } catch (err) {
//     setEmailError(err.message || "Signup failed");
//   }
// };

//   return (
//     <div className="max-w-md mx-auto mt-20 px-4">
//       <div className={`${bgClass} p-8 rounded-lg shadow-lg`}>
//         <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>

//         {/* EMAIL */}
//         <input
//           className={`w-full p-3 border ${borderClass} rounded ${inputBg} ${textClass}`}
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         {emailError && (
//           <p className="text-red-600 text-sm mt-1">{emailError}</p>
//         )}

//         {/* PASSWORD */}
//         <input
//           className={`w-full p-3 border ${borderClass} rounded mt-4 ${inputBg}`}
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         {passwordError && (
//           <p className="text-red-600 text-sm mt-1">{passwordError}</p>
//         )}

//         {/* PASSWORD STRENGTH */}
//         {password && (
//           <div className="mt-2">
//             <div className="flex gap-1">
//               {[1, 2, 3, 4].map((n) => (
//                 <div
//                   key={n}
//                   className={`h-2 flex-1 rounded ${
//                     strength >= n
//                       ? strength <= 2
//                         ? "bg-red-500"
//                         : strength === 3
//                         ? "bg-yellow-500"
//                         : "bg-green-600"
//                       : "bg-gray-300"
//                   }`}
//                 />
//               ))}
//             </div>
//             <p className={`text-xs mt-1 ${isDarkMode?"text-green-300":"text-green-600"}`}>
//               {strength <= 2 && "Weak"}
//               {strength === 3 && "Medium"}
//               {strength === 4 && "Strong"}
//             </p>
//           </div>
//         )}

//         <button
//           disabled={!canSubmit}
//           onClick={onSignup}
//           className={`w-full p-3 rounded mt-6 text-white ${
//             canSubmit
//               ? "bg-green-600 hover:bg-green-700"
//               : "bg-gray-400 cursor-not-allowed"
//           }`}
//         >
//           Create Account
//         </button>

//         <p className="text-center mt-4 text-sm">
//           Already have an account?{" "}
//           <button
//             onClick={() => onNavigate("login")}
//             className="text-green-600 font-medium"
//           >
//             Login
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default SignupPage;

// src/components/SignupPage.jsx

import React, { useEffect, useState } from "react";
import { validateEmail, validatePassword, passwordStrength } from "../utils/validation";
import { api } from "../utils/api";

function SignupPage({ onNavigate, isDarkMode }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userType: "taxpayer", // default
    gender: "male",       // default
  });

  const [errors, setErrors] = useState({});
  const [canSubmit, setCanSubmit] = useState(false);

  const bgClass = isDarkMode ? 'bg-green-900' : 'bg-green-100';
  const inputBg = isDarkMode ? 'bg-green-800' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const borderClass = isDarkMode ? 'border-green-700' : 'border-green-300';

  // Validation
  useEffect(() => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Invalid email address";

    if (!formData.password) newErrors.password = "Password is required";
    else if (!validatePassword(formData.password))
      newErrors.password = "Password must be 8+ chars with uppercase, lowercase & number";

    setErrors(newErrors);
    setCanSubmit(Object.keys(newErrors).length === 0 && formData.name && formData.email && formData.password);
  }, [formData]);

  const strength = passwordStrength(formData.password);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const onSignup = async () => {
    if (!canSubmit) return;

    try {
      await api.post("/signup", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        userType: formData.userType,
        gender: formData.gender,
      });

      alert("Account created successfully! Please log in.");
      onNavigate("login");
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Signup failed. Try again.";
      setErrors(prev => ({ ...prev, submit: msg }));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <div className={`${bgClass} p-8 rounded-xl shadow-xl`}>
        <h2 className="text-3xl font-bold mb-8 text-center">Create Account</h2>

        {/* Name */}
        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange("name")}
          className={`w-full p-4 mb-2 border ${borderClass} rounded-lg ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-green-500`}
        />
        {errors.name && <p className="text-red-500 text-sm mb-4">{errors.name}</p>}

        {/* Email */}
        <input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange("email")}
          className={`w-full p-4 mb-2 border ${borderClass} rounded-lg ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-green-500`}
        />
        {errors.email && <p className="text-red-500 text-sm mb-4">{errors.email}</p>}

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange("password")}
          className={`w-full p-4 mb-2 border ${borderClass} rounded-lg ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-green-500`}
        />
        {errors.password && <p className="text-red-500 text-sm mb-4">{errors.password}</p>}

        {/* Password Strength */}
        {formData.password && (
          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    strength >= n
                      ? strength <= 2 ? "bg-red-500" : strength === 3 ? "bg-yellow-500" : "bg-green-600"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs opacity-80">
              Password strength: {strength <= 2 ? "Weak" : strength === 3 ? "Medium" : "Strong"}
            </p>
          </div>
        )}

        {/* User Type */}
        <select
          value={formData.userType}
          onChange={handleChange("userType")}
          className={`w-full p-4 mb-4 border ${borderClass} rounded-lg ${inputBg} ${textClass}`}
        >
          <option value="taxpayer">Taxpayer</option>
          <option value="consultant">Tax Consultant</option>
          <option value="business">Business Owner</option>
          <option value="student">Student/Researcher</option>
        </select>

        {/* Gender */}
        <select
          value={formData.gender}
          onChange={handleChange("gender")}
          className={`w-full p-4 mb-6 border ${borderClass} rounded-lg ${inputBg} ${textClass}`}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Prefer not to say</option>
        </select>

        {/* Submit Error */}
        {errors.submit && <p className="text-red-500 text-center mb-4">{errors.submit}</p>}

        {/* Submit Button */}
        <button
          disabled={!canSubmit}
          onClick={onSignup}
          className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
            canSubmit
              ? "bg-green-600 hover:bg-green-700 shadow-lg"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Create Account
        </button>

        <p className="text-center mt-6 text-sm opacity-80">
          Already have an account?{" "}
          <button
            onClick={() => onNavigate("login")}
            className="text-green-600 font-semibold hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;