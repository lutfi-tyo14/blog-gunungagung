"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) setError(error.message);
    else setSuccess("Email reset password telah dikirim. Silakan cek email Anda.");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-green-200 via-blue-100 to-white relative overflow-hidden">
      {/* Ornamen awan */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-40 rounded-full blur-2xl -z-10" style={{top: '-40px', left: '-40px'}} />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-100 opacity-30 rounded-full blur-2xl -z-10" style={{bottom: '-60px', right: '-60px'}} />
      <Image src="/mountain.svg" alt="Gunung" width={70} height={70} className="mb-2 drop-shadow-lg animate-bounce-slow" />
      <h2 className="text-3xl font-extrabold mb-2 text-blue-800 drop-shadow">Lupa Password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs bg-white/80 rounded-xl shadow-lg p-6 mt-4">
        <input
          type="email"
          placeholder="Masukkan email Anda"
          value={email}
          onChange={e => setEmail(e.target.value)}
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
          {loading ? "Mengirim..." : "Kirim Link Reset Password"}
        </button>
      </form>
      <button className="mt-4 text-blue-600 underline" onClick={() => router.push("/auth/login")}>Kembali ke Login</button>
    </div>
  );
} 