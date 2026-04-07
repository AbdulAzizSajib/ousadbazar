"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import axios from "axios";
import { apiBasePharma } from "@/lib/config";
import { showNotification } from "@/lib/notification";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", username: "", phone: "", dob: "", gender: "", address: "" });

  const validateMobile = (value: string) => {
    const v = String(value ?? "").trim();
    if (!v) return "Mobile number is required";
    if (!v.startsWith("01")) return "Mobile number must start with 01";
    if (!/^\d+$/.test(v)) return "Mobile number must contain only digits";
    if (v.length > 11) return "Mobile number cannot exceed 11 digits";
    if (v.length < 11) return "Mobile number must be 11 digits";
    return "";
  };

  const validationError = useMemo(() => validateMobile(formData.phone), [formData.phone]);
  const isValidMobile = validationError === "";

  const onlyNumber = (value: string) => {
    let v = value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    setFormData((prev) => ({ ...prev, phone: v }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return showNotification("warning", "Name is required");
    if (!formData.email) return showNotification("warning", "Email is required");
    if (!formData.password) return showNotification("warning", "Password is required");
    if (!formData.phone) return showNotification("warning", "Phone Number is required");
    setIsLoading(true);
    try {
      const res = await axios.post(`${apiBasePharma}/user-register`, formData);
      if (res?.data?.status === "success") {
        showNotification("success", res.data.message);
        setTimeout(() => router.push("/login"), 1000);
      } else {
        showNotification("error", "Registration Failed");
      }
    } catch (error: unknown) {
      setIsLoading(false);
      const axiosError = error as { response?: { data?: { message?: Record<string, string[]> | string } } };
      const messages = axiosError.response?.data?.message;
      if (messages && typeof messages === "object") {
        Object.values(messages).forEach((msgs) => {
          if (Array.isArray(msgs)) msgs.forEach((msg) => showNotification("error", msg));
        });
      } else {
        showNotification("error", "Something went wrong");
      }
    }
  };

  return (
    <section className="flex mt-28 justify-center items-center p-4">
      <div className="w-full">
        <form onSubmit={handleRegister} className="max-w-md mx-auto p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl space-y-6">
          <h2 className="text-2xl font-bold text-center text-green-700">Create an Account</h2>
          <div className="space-y-5">
            <div>
              <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Name <span className="text-red-500">*</span></label>
              <input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} type="text" placeholder="Enter your name" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 dark:bg-gray-700 dark:text-gray-100" />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Email <span className="text-red-500">*</span></label>
              <input value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} type="email" placeholder="Enter your email" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 dark:bg-gray-700 dark:text-gray-100" />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Password <span className="text-red-500">*</span></label>
              <input value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} type="password" placeholder="Create a password" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 dark:bg-gray-700 dark:text-gray-100" />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Phone <span className="text-red-500">*</span></label>
              <input value={formData.phone} onChange={(e) => onlyNumber(e.target.value)} type="tel" placeholder="Your phone number" className={`w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 dark:bg-gray-700 dark:text-gray-100 ${!isValidMobile && formData.phone ? "border-red-400" : ""}`} />
              {!isValidMobile && formData.phone && <p className="text-red-500 text-xs mt-1">{validationError}</p>}
            </div>
          </div>
          <div className="space-y-4">
            <button disabled={isLoading} type="submit" className="w-full px-4 py-3 font-semibold text-white rounded-lg bg-gradient-to-r from-green-600 to-green-400 hover:from-green-500 hover:to-green-300 transition-all duration-300 shadow-lg flex justify-center items-center gap-5">
              <span>{isLoading ? "Processing ..." : "Register"}</span>
              {isLoading && <Icon className="w-5 h-5 animate-spin" icon="icon-park-outline:loading" />}
            </button>
            <p className="text-sm text-center text-gray-600">
              Have an account? <Link href="/login" className="text-green-700 font-medium hover:underline">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
