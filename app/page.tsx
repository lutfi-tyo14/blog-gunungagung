"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
      if (data.session) {
        router.replace("/posts");
      }
    };
    getSession();
  }, [router]);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8 bg-gradient-to-b from-blue-100 to-white">
      <Image src="/globe.svg" alt="Gunung Agung" width={80} height={80} />
      <h1 className="text-3xl font-bold mb-2">Gunung Agung Info Platform</h1>
      <p className="text-center max-w-xl mb-4 text-lg text-gray-700">
        Selamat datang di platform informasi Gunung Agung! Temukan, bagikan, dan diskusikan informasi terbaru seputar Gunung Agung. Login atau daftar untuk mulai memposting dan berinteraksi dengan komunitas.
      </p>
      <div className="flex gap-4">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => router.push("/auth/login")}
        >
          Login
        </button>
        <button
          className="bg-white border border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50 transition"
          onClick={() => router.push("/auth/register")}
        >
          Register
        </button>
      </div>
    </div>
  );
}
