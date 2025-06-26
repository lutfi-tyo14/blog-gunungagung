"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import Image from "next/image";

interface Profile {
  id: string;
  email: string;
  username?: string;
  role: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: { username?: string; email?: string };
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roleUpdate, setRoleUpdate] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/");
        return;
      }
      // Ambil semua postingan
      const { data: allPosts } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const posts: Post[] = (allPosts || []).map((p: any) => ({ ...p, profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles }));
      // Ambil semua user
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setProfiles(profilesData || []);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleRoleChange = (userId: string, newRole: string) => {
    setRoleUpdate((prev) => ({ ...prev, [userId]: newRole }));
  };

  const handleUpdateRole = async (userId: string) => {
    const newRole = roleUpdate[userId];
    if (!newRole) return;
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    if (error) console.error("Gagal mengupdate role:", error.message);
  };

  const handleResetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) console.error("Gagal mengirim email reset password:", error.message);
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gradient-to-b from-green-200 via-blue-100 to-white relative overflow-hidden">
      {/* Ornamen awan */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-white opacity-40 rounded-full blur-2xl -z-10" style={{top: '-60px', left: '-60px'}} />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-blue-100 opacity-30 rounded-full blur-2xl -z-10" style={{bottom: '-80px', right: '-80px'}} />
      <div className="w-full max-w-3xl bg-white/90 rounded-xl shadow-lg p-8 flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-2 flex items-center gap-2">
          <Image src="/mountain.svg" alt="Gunung" width={32} height={32} className="inline-block drop-shadow animate-bounce-slow" />
          Dashboard
        </h1>
        {/* User & Admin */}
        {(profiles.some(p => p.role === "user" || p.role === "admin")) && (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Semua Profil</h2>
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="border px-2 py-1">Email</th>
                    <th className="border px-2 py-1">Username</th>
                    <th className="border px-2 py-1">Role</th>
                    <th className="border px-2 py-1">Aksi</th>
                    <th className="border px-2 py-1">Reset Password</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.id}>
                      <td className="border px-2 py-1">{p.email}</td>
                      <td className="border px-2 py-1">{p.username || '-'}</td>
                      <td className="border px-2 py-1">{p.role}</td>
                      <td className="border px-2 py-1">
                        <select
                          value={roleUpdate[p.id] || p.role}
                          onChange={e => handleRoleChange(p.id, e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                        <button
                          className="ml-2 bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs"
                          onClick={() => handleUpdateRole(p.id)}
                        >Update</button>
                      </td>
                      <td className="border px-2 py-1 text-center">
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                          onClick={() => handleResetPassword(p.email)}
                        >Reset</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 