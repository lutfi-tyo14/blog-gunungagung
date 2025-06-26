"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";

export default function ConfirmResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract parameters from URL
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  useEffect(() => {
    const validateToken = async () => {
      if (!tokenHash || type !== "recovery") {
        setError("Link reset password tidak valid atau sudah kadaluarsa.");
        setValidating(false);
        return;
      }

      try {
        // Verify the recovery token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery'
        });

        if (error) {
          setError("Token reset password tidak valid atau sudah kadaluarsa.");
        }
        setValidating(false);
      } catch {
        setError("Terjadi kesalahan saat memvalidasi token.");
        setValidating(false);
      }
    };

    validateToken();
  }, [tokenHash, type]);

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

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      // Update password using the recovery token
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Password berhasil direset! Mengarahkan ke halaman login...");
        // Redirect immediately to login page
        router.replace("/auth/login");
      }
    } catch {
      setError("Terjadi kesalahan saat reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-green-200 via-blue-100 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memvalidasi token...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-green-200 via-blue-100 to-white relative overflow-hidden">
        {/* Ornamen awan */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-40 rounded-full blur-2xl -z-10" style={{top: '-40px', left: '-40px'}} />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-100 opacity-30 rounded-full blur-2xl -z-10" style={{bottom: '-60px', right: '-60px'}} />
        <Image src="/mountain.svg" alt="Gunung" width={70} height={70} className="mb-2 drop-shadow-lg animate-bounce-slow" />
        <h2 className="text-3xl font-extrabold mb-2 text-blue-800 drop-shadow">Reset Password</h2>
        <p className="text-gray-600 mb-6 text-center">Masukkan password baru untuk akun Anda</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs bg-white/80 rounded-xl shadow-lg p-6">
          <input
            type="password"
            placeholder="Password baru"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            minLength={6}
          />
          <input
            type="password"
            placeholder="Konfirmasi password baru"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            minLength={6}
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center">{success}</p>}
          <button
            type="submit"
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 rounded-xl shadow-lg hover:scale-105 hover:from-green-600 hover:to-blue-700 transition-all text-lg font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Reset Password"}
          </button>
        </form>
        <button 
          className="mt-4 text-blue-600 underline hover:text-blue-800 transition-colors" 
          onClick={() => router.push("/auth/login")}
        >
          Kembali ke Login
        </button>
      </div>
    </Suspense>
  );
} 