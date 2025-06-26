"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { useState } from "react";
import Image from "next/image";
import type { Session } from "@supabase/supabase-js";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

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

  if (loading) return <div className="flex justify-center items-center min-h-screen">Memuat...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8 bg-gradient-to-b from-green-200 via-blue-100 to-white relative overflow-hidden">
      {/* Ornamen awan */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-white opacity-40 rounded-full blur-2xl -z-10" style={{top: '-60px', left: '-60px'}} />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-blue-100 opacity-30 rounded-full blur-2xl -z-10" style={{bottom: '-80px', right: '-80px'}} />
      {/* Ikon gunung */}
      <Image src="/mountain.svg" alt="Gunung" width={90} height={90} className="drop-shadow-lg animate-bounce-slow" />
      <h1 className="text-4xl font-extrabold mb-2 text-blue-800 drop-shadow">Selamat Datang di <span className="text-green-700">Gunung Agung</span> Info</h1>
      <p className="text-center max-w-xl mb-4 text-lg text-gray-700 font-medium">
        Temukan, bagikan, dan diskusikan informasi terbaru seputar <span className="font-bold text-green-800">Gunung Agung</span>.<br />
        Login atau daftar untuk mulai memposting dan berinteraksi dengan komunitas pecinta alam!
      </p>
      <div className="flex gap-6 mt-2">
        <button
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-xl shadow-lg hover:scale-105 hover:from-green-600 hover:to-blue-700 transition-all text-lg font-bold tracking-wide border-2 border-blue-200"
          onClick={() => router.push("/auth/login")}
        >
          Masuk
        </button>
        <button
          className="bg-white border-2 border-green-500 text-green-700 px-8 py-3 rounded-xl shadow-lg hover:bg-green-50 hover:scale-105 transition-all text-lg font-bold tracking-wide"
          onClick={() => router.push("/auth/register")}
        >
          Daftar
        </button>
      </div>
      <div className="mt-8 text-gray-400 text-sm">© {new Date().getFullYear()} Gunung Agung Info Platform</div>
    </div>
  );
}
