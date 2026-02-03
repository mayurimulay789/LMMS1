"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, Mail, Lock, BookOpen } from "lucide-react";
import { loginUser, clearError,loadUser } from "../store/slices/authSlice";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from;
      if (from && from !== "/login") {
        navigate(from, { replace: true });
      } else {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.role === "admin") navigate("/admin");
        else if (user?.role === "instructor") navigate("/instructor");
        else navigate("/dashboard");
      }
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email address";

    if (!formData.password)
      newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Minimum 6 characters required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    dispatch(loginUser(formData));
    dispatch(loadUser());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-blue-50 flex mt-4 justify-center px-4">
      <div className="w-full max-w-md">

        {/* BRAND HEADER */}
        <div className="text-center mb-3">
          
          <p className="text-primary-600 text-base font-semibold flex items-center justify-center gap-2 mb-2">
            Sign in to continue your learning journey
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full rounded-lg border px-10 py-3 text-sm focus:ring-2 focus:ring-rose-600 focus:border-transparent ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border px-10 py-3 pr-12 text-sm focus:ring-2 focus:ring-rose-600 focus:border-transparent ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-rose-700 hover:text-rose-800 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-rose-700 py-3 text-white font-semibold hover:bg-rose-800 transition disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-rose-700 hover:text-rose-800"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
