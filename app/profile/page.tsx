"use client";
import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/");
        return;
      }
      setUser(data.session.user);
      // Ambil data profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", data.session.user.id)
        .single();
      if (profile) {
        setUsername(profile.username || "");
        setAvatarUrl(profile.avatar_url || "");
      }
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file)); // preview
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;
    setUploading(true);
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile, { upsert: true });
    setUploading(false);
    if (error) {
      setError("Gagal upload foto profil: " + error.message);
      return null;
    }
    // Dapatkan public URL
    const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(fileName);
    return publicUrl?.publicUrl || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    let finalAvatarUrl = avatarUrl;
    if (avatarFile) {
      const uploadedUrl = await uploadAvatar();
      if (uploadedUrl) finalAvatarUrl = uploadedUrl;
      else return;
    }
    const { error } = await supabase.from("profiles").update({ username, avatar_url: finalAvatarUrl }).eq("id", user.id);
    if (error) setError(error.message);
    else {
      setSuccess("Profil berhasil diperbarui!");
      setShowEdit(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gradient-to-b from-blue-100 to-white">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center gap-6">
        {/* Ringkasan Profile */}
        {!showEdit && (
          <>
            <img
              src={avatarUrl || "/file.svg"}
              alt="Foto Profil"
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-200 shadow mb-2"
            />
            <h2 className="text-2xl font-bold text-blue-700 mb-1">{username || user?.email}</h2>
            <p className="text-gray-500 mb-4">{user?.email}</p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold text-lg"
              onClick={() => setShowEdit(true)}
            >
              Edit Profil
            </button>
            <button
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold text-lg w-full"
              onClick={async () => {
                await supabase.auth.signOut();
                router.replace("/");
              }}
            >
              Logout
            </button>
            <button className="mt-2 text-blue-600 underline" onClick={() => router.push("/posts")}>Kembali ke Postingan</button>
          </>
        )}
        {/* Form Edit Profile */}
        {showEdit && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <img
                  src={avatarUrl || "/file.svg"}
                  alt="Foto Profil"
                  className="w-28 h-28 rounded-full object-cover border-4 border-blue-200 shadow"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-full">
                    <span className="text-blue-700 font-bold">Uploading...</span>
                  </div>
                )}
              </div>
              <label className="mt-2 cursor-pointer bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition">
                Pilih Foto
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <label className="flex flex-col gap-2">
              <span className="font-semibold">Username</span>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="border p-2 rounded" required />
            </label>
            {error && <p className="text-red-500 text-center">{error}</p>}
            {success && <p className="text-green-600 text-center">{success}</p>}
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold text-lg">Simpan</button>
              <button type="button" className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 font-semibold text-lg" onClick={() => setShowEdit(false)}>Batal</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 