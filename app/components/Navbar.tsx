"use client";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{ username?: string; avatar_url?: string } | null>(null);
  const router = useRouter();

  // Ambil session dan profile user setiap kali session berubah
  useEffect(() => {
    let authListener: any;
    const getSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", session.user.id)
          .single();
        setProfile(profile);
      } else {
        setProfile(null);
      }
    };
    getSessionAndProfile();
    authListener = supabase.auth.onAuthStateChange(() => {
      getSessionAndProfile();
    });
    return () => {
      if (authListener && typeof authListener.subscription?.unsubscribe === "function") {
        authListener.subscription.unsubscribe();
      }
    };
  }, [router]);

  return (
    <nav className="w-full bg-white shadow flex items-center px-4 py-2 gap-4 sticky top-0 z-10">
      <Link href="/posts" className="font-bold text-blue-700 text-lg">Gunung Agung</Link>
      <div className="flex-1 flex justify-center gap-6">
        {user && (
          <>
            <Link href="/posts" className="hover:underline">Beranda</Link>
            <Link href="/posts/new" className="hover:underline">Buat Postingan</Link>
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          </>
        )}
      </div>
      {user ? (
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 focus:outline-none"
            onClick={() => router.push("/profile")}
            aria-label="Profile"
          >
            <img
              src={profile?.avatar_url || "/file.svg"}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border border-blue-200 bg-gray-100"
            />
          </button>
        </div>
      ) : (
        <div className="ml-auto flex gap-2">
          <Link href="/auth/login" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Login</Link>
          <Link href="/auth/register" className="bg-gray-200 text-blue-700 px-3 py-1 rounded hover:bg-gray-300">Register</Link>
        </div>
      )}
    </nav>
  );
} 