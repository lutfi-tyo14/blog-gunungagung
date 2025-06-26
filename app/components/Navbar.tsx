"use client";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

interface UserProfile {
  username?: string;
  avatar_url?: string;
}

interface UserSession {
  id: string;
  email?: string;
  role?: string;
}

function isActive(path: string, current: string) {
  return path === current
    ? "text-blue-700 font-bold underline underline-offset-8"
    : "text-gray-700 font-semibold hover:underline hover:underline-offset-8";
}

export default function Navbar() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let authListener: any = null;
    const getSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
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
    <nav className="w-full bg-white/80 backdrop-blur border-b border-blue-100 shadow-sm flex items-center px-6 py-3 gap-4 sticky top-0 z-20 font-sans">
      <Link href="/posts" className="font-extrabold text-2xl text-blue-700 tracking-tight mr-6">Gunung Agung</Link>
      <div className="flex-1 flex justify-center gap-8">
        {user && (
          <>
            <Link href="/posts" className={`transition ${isActive("/posts", pathname)}`}>Beranda</Link>
            <Link href="/posts/new" className={`transition ${isActive("/posts/new", pathname)}`}>Buat Postingan</Link>
            <Link href="/dashboard" className={`transition ${isActive("/dashboard", pathname)}`}>Dashboard</Link>
          </>
        )}
      </div>
      {user ? (
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 focus:outline-none group"
            onClick={() => router.push("/profile")}
            aria-label="Profile"
          >
            <span className="hidden sm:block font-semibold text-blue-700 group-hover:underline transition">{profile?.username || user.email}</span>
            <span className="relative">
              <Image
                src={profile?.avatar_url || "/file.svg"}
                alt="Avatar"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-300 shadow ring-2 ring-blue-200 group-hover:ring-blue-400 transition"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
            </span>
          </button>
        </div>
      ) : (
        <div className="ml-auto flex gap-2">
          <Link href="/auth/login" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition font-semibold">Login</Link>
          <Link href="/auth/register" className="bg-gray-100 text-blue-700 px-4 py-1.5 rounded-lg hover:bg-blue-200 transition font-semibold">Register</Link>
        </div>
      )}
    </nav>
  );
} 