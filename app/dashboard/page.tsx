"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

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
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [roleUpdate, setRoleUpdate] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/");
        return;
      }
      setUser(session.user);
      // Ambil profile user
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, email, username, role")
        .eq("id", session.user.id)
        .single();
      setProfile(profile);
      // Ambil semua postingan
      const { data: allPosts } = await supabase
        .from("posts")
        .select("id, title, content, created_at, user_id, profiles:profiles(username,email)")
        .order("created_at", { ascending: false });
      const mappedPosts: Post[] = (allPosts || []).map((p: any) => ({ ...p, profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles }));
      setPosts(mappedPosts);
      // Ambil postingan sendiri
      setMyPosts(mappedPosts.filter((p) => p.user_id === session.user.id));
      // Jika super admin, ambil semua user
      if (profile?.role === "super_admin") {
        const { data: allProfiles } = await supabase
          .from("profiles")
          .select("id, email, username, role");
        setAllProfiles(allProfiles || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleRoleChange = (userId: string, newRole: string) => {
    setRoleUpdate((prev) => ({ ...prev, [userId]: newRole }));
  };

  const handleUpdateRole = async (userId: string) => {
    setError(""); setSuccess("");
    const newRole = roleUpdate[userId];
    if (!newRole) return;
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    if (error) setError(error.message);
    else setSuccess("Role berhasil diupdate!");
  };

  const handleResetPassword = async (email: string) => {
    setError(""); setSuccess("");
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setError("Gagal mengirim email reset password: " + error.message);
    else setSuccess("Email reset password telah dikirim ke " + email);
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!profile) return null;

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gradient-to-b from-green-200 via-blue-100 to-white relative overflow-hidden">
      {/* Ornamen awan */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-white opacity-40 rounded-full blur-2xl -z-10" style={{top: '-60px', left: '-60px'}} />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-blue-100 opacity-30 rounded-full blur-2xl -z-10" style={{bottom: '-80px', right: '-80px'}} />
      <div className="w-full max-w-3xl bg-white/90 rounded-xl shadow-lg p-8 flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-2 flex items-center gap-2">
          <img src="/mountain.svg" alt="Gunung" width={32} height={32} className="inline-block drop-shadow animate-bounce-slow" />
          Dashboard ({profile.role.replace('_', ' ').toUpperCase()})
        </h1>
        {/* User & Admin */}
        {(profile.role === "user" || profile.role === "admin") && (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Profil Saya</h2>
              <div className="flex flex-col gap-1">
                <span><b>Username:</b> {profile.username || '-'}</span>
                <span><b>Email:</b> {profile.email}</span>
                <span><b>Role:</b> {profile.role}</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Postingan Saya</h2>
              {myPosts.length === 0 && <div className="text-gray-400">Belum ada postingan.</div>}
              <ul className="list-disc ml-6">
                {myPosts.map((p) => (
                  <li key={p.id} className="mb-1 flex items-center gap-2">
                    <span className="font-semibold">{p.title}</span> <span className="text-xs text-gray-500">({new Date(p.created_at).toLocaleString()})</span>
                    <button
                      className="ml-2 bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500 text-xs"
                      onClick={() => router.push(`/posts/${p.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="ml-2 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs"
                      onClick={async () => {
                        if (confirm('Yakin ingin menghapus postingan ini?')) {
                          const { error } = await supabase.from('posts').delete().eq('id', p.id);
                          if (!error) setMyPosts(myPosts.filter(post => post.id !== p.id));
                          if (!error) setPosts(posts.filter(post => post.id !== p.id));
                        }
                      }}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
        {/* Admin & Super Admin */}
        {(profile.role === "admin" || profile.role === "super_admin") && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Semua Postingan</h2>
            {posts.length === 0 && <div className="text-gray-400">Belum ada postingan.</div>}
            <ul className="list-disc ml-6">
              {posts.map((p) => (
                <li key={p.id} className="mb-1 flex items-center gap-2">
                  <span className="font-semibold">{p.title}</span> oleh {p.profiles?.username || p.profiles?.email || 'Anonim'} <span className="text-xs text-gray-500">({new Date(p.created_at).toLocaleString()})</span>
                  {p.user_id === profile.id && (
                    <button
                      className="ml-2 bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500 text-xs"
                      onClick={() => router.push(`/posts/${p.id}/edit`)}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    className="ml-2 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs"
                    onClick={async () => {
                      if (confirm('Yakin ingin menghapus postingan ini?')) {
                        const { error } = await supabase.from('posts').delete().eq('id', p.id);
                        if (!error) setPosts(posts.filter(post => post.id !== p.id));
                        if (!error) setMyPosts(myPosts.filter(post => post.id !== p.id));
                      }
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Super Admin Only */}
        {profile.role === "super_admin" && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Manajemen User</h2>
            {success && <div className="text-green-600 mb-2">{success}</div>}
            {error && <div className="text-red-600 mb-2">{error}</div>}
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
                {allProfiles.map((u) => (
                  <tr key={u.id}>
                    <td className="border px-2 py-1">{u.email}</td>
                    <td className="border px-2 py-1">{u.username || '-'}</td>
                    <td className="border px-2 py-1">{u.role}</td>
                    <td className="border px-2 py-1">
                      <select
                        value={roleUpdate[u.id] || u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="border rounded px-2 py-1"
                        disabled={u.id === profile.id}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                        <option value="super_admin">super_admin</option>
                      </select>
                      <button
                        className="ml-2 bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs"
                        onClick={() => handleUpdateRole(u.id)}
                        disabled={u.id === profile.id}
                      >Update</button>
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                        onClick={() => handleResetPassword(u.email)}
                        disabled={u.id === profile.id}
                      >Reset</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 