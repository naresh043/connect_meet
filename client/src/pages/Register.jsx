import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import {
  Video,
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { registerUser } from "../features/auth/authSlice";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    const result = await dispatch(registerUser(formData));

    if (registerUser.fulfilled.match(result)) {
      navigate("/login");
    }
  };

  const isDisabled =
    isLoading ||
    !formData.name.trim() ||
    !formData.email.trim() ||
    !formData.password.trim();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F6F7FB] px-4 py-8 text-slate-900 sm:px-6">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-cyan-100/50 blur-3xl" />

      {/* Register Card */}
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          {/* Logo / Brand */}
          <div className="flex flex-col items-center text-center">
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-indigo-600
                text-white
                shadow-md
                shadow-indigo-200/60
              "
            >
              <Video size={21} strokeWidth={2.2} />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                Create account
              </h1>

              <Sparkles size={17} className="text-indigo-500" strokeWidth={2} />
            </div>

            <p className="mt-1.5 text-sm text-slate-500">
              Join ConnectMeet and start connecting
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="
                mt-6
                rounded-xl
                border
                border-red-100
                bg-red-50
                px-4
                py-3
                text-sm
                font-medium
                text-red-600
              "
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Full name
              </label>

              <div className="relative">
                <User
                  size={17}
                  strokeWidth={2}
                  className="
                    pointer-events-none
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <Input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  autoComplete="name"
                  disabled={isLoading}
                  required
                  className="
                    h-12
                    rounded-xl
                    border-slate-200
                    bg-slate-50/70
                    pl-10
                    pr-4
                    text-sm
                    font-medium
                    text-slate-900
                    shadow-none
                    transition
                    placeholder:text-slate-400
                    focus:border-indigo-400
                    focus:bg-white
                    focus:ring-4
                    focus:ring-indigo-500/10
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  strokeWidth={2}
                  className="
                    pointer-events-none
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={isLoading}
                  required
                  className="
                    h-12
                    rounded-xl
                    border-slate-200
                    bg-slate-50/70
                    pl-10
                    pr-4
                    text-sm
                    font-medium
                    text-slate-900
                    shadow-none
                    transition
                    placeholder:text-slate-400
                    focus:border-indigo-400
                    focus:bg-white
                    focus:ring-4
                    focus:ring-indigo-500/10
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={17}
                  strokeWidth={2}
                  className="
                    pointer-events-none
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={6}
                  disabled={isLoading}
                  required
                  className="
                    h-12
                    rounded-xl
                    border-slate-200
                    bg-slate-50/70
                    pl-10
                    pr-4
                    text-sm
                    font-medium
                    text-slate-900
                    shadow-none
                    transition
                    placeholder:text-slate-400
                    focus:border-indigo-400
                    focus:bg-white
                    focus:ring-4
                    focus:ring-indigo-500/10
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Password must be at least 6 characters.
              </p>
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              disabled={isDisabled}
              className="
                h-12
                w-full
                rounded-xl
                bg-indigo-600
                px-5
                text-sm
                font-semibold
                text-white
                shadow-md
                shadow-indigo-200/50
                transition-all
                duration-200
                cursor-pointer
                hover:-translate-y-0.5
                hover:bg-indigo-700
                hover:shadow-lg
                hover:shadow-indigo-200/60
                focus:ring-4
                focus:ring-indigo-500/20
                disabled:translate-y-0
                disabled:cursor-not-allowed
                disabled:opacity-50
                disabled:shadow-none
              "
            >
              {isLoading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={17} />
                </>
              )}
            </Button>
          </form>

          {/* Login */}
          <div className="mt-7">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>

              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-slate-400">
                  Already a member?
                </span>
              </div>
            </div>

            <p className="mt-5 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="
                  font-semibold
                  text-indigo-600
                  transition-colors
                  hover:text-indigo-700
                  hover:underline
                "
              >
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-xs text-slate-400">
          Secure video meetings, made simple.
        </p>
      </div>
    </div>
  );
};

export default Register;
