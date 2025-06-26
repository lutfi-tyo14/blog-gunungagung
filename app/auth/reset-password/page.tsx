"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Supabase mengirim access_token di query string
  const accessToken = searchParams.get("access_token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!password || !confirmPassword) {
      setError("Password tidak boleh kosong.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi tidak sama.");
      return;
    }
    if (!accessToken) {
      setError("Token reset password tidak valid atau sudah kadaluarsa.");
      return;
    }
    setLoading(true);
    // Update password via Supabase
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setError(error.message);
    else {
      setSuccess("Password berhasil direset! Silakan login dengan password baru.");
      setTimeout(() => router.replace("/auth/login"), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-green-200 via-blue-100 to-white relative overflow-hidden">
      {/* Ornamen awan */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-40 rounded-full blur-2xl -z-10" style={{top: '-40px', left: '-40px'}} />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-100 opacity-30 rounded-full blur-2xl -z-10" style={{bottom: '-60px', right: '-60px'}} />
      <img src="/mountain.svg" alt="Gunung" width={70} height={70} className="mb-2 drop-shadow-lg animate-bounce-slow" />
      <h2 className="text-3xl font-extrabold mb-2 text-blue-800 drop-shadow">Reset Password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs bg-white/80 rounded-xl shadow-lg p-6 mt-4">
        <input
          type="password"
          placeholder="Password baru"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="border p-2 rounded-lg"
        />
        <input
          type="password"
          placeholder="Konfirmasi password baru"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          className="border p-2 rounded-lg"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
        <button
          type="submit"
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 rounded-xl shadow-lg hover:scale-105 hover:from-green-600 hover:to-blue-700 transition-all text-lg font-bold tracking-wide"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Reset Password"}
        </button>
      </form>
      <button className="mt-4 text-blue-600 underline" onClick={() => router.push("/auth/login")}>Kembali ke Login</button>
    </div>
  );
} 