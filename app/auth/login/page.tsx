"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.replace("/posts");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-green-200 via-blue-100 to-white relative overflow-hidden">
      {/* Ornamen awan */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-40 rounded-full blur-2xl -z-10" style={{top: '-40px', left: '-40px'}} />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-100 opacity-30 rounded-full blur-2xl -z-10" style={{bottom: '-60px', right: '-60px'}} />
      {/* Ikon gunung */}
      <Image src="/mountain.svg" alt="Gunung" width={70} height={70} className="mb-2 drop-shadow-lg animate-bounce-slow" />
      <h2 className="text-3xl font-extrabold mb-2 text-blue-800 drop-shadow">Masuk ke <span className="text-green-700">Gunung Agung</span></h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-xs bg-white/80 rounded-xl shadow-lg p-6 mt-4">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="border p-2 rounded-lg" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="border p-2 rounded-lg" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 rounded-xl shadow-lg hover:scale-105 hover:from-green-600 hover:to-blue-700 transition-all text-lg font-bold tracking-wide">Masuk</button>
      </form>
      <button
        className="mt-2 text-blue-600 underline"
        onClick={() => router.push("/auth/forgot-password")}
      >
        Lupa password?
      </button>
      <button className="mt-4 text-blue-600 underline" onClick={() => router.push("/auth/register")}>Belum punya akun? <span className="font-semibold">Daftar</span></button>
    </div>
  );
} 