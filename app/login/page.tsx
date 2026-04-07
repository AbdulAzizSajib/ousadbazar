"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import axios from "axios";
import { apiBasePharma } from "@/lib/config";
import { showNotification } from "@/lib/notification";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email) return showNotification("warning", "email required");
    if (!password) return showNotification("warning", "password required");
    setIsLoading(true);
    try {
      const res = await axios.post(`${apiBasePharma}/user-login`, { email, password });
      setIsLoading(false);
      if (res?.data?.status === "success") {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        showNotification("success", res.data.message);
        setTimeout(() => router.push("/"), 500);
      } else if (res?.data?.status === "error") {
        showNotification("error", res.data.message);
      } else {
        showNotification("error", "Unexpected response format");
      }
    } catch (error: unknown) {
      setIsLoading(false);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showNotification("error", axiosError.response?.data?.message || "Network or server error");
    }
  };

  return (
    <section className="flex mt-28 justify-center items-center p-4 min-h-screen">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 rounded-lg p-6 md:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Login</h1>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
          <div className="space-y-4">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring focus:ring-green-200 dark:bg-gray-700 dark:text-gray-100" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring focus:ring-green-200 dark:bg-gray-700 dark:text-gray-100" />
          </div>
          <div className="space-y-4">
            <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-green-700 rounded-lg hover:bg-green-600 transition-all flex justify-center gap-2">
              <span>{isLoading ? "Processing ..." : "Login"}</span>
              {isLoading && <Icon className="w-5 h-5 animate-spin" icon="icon-park-outline:loading" />}
            </button>
            <p className="text-sm text-center text-gray-600">
              Don&apos;t have an account yet?{" "}
              <Link href="/register" className="items-center px-1 text-green-700 capitalize hover:underline">Register</Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
