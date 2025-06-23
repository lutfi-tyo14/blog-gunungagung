"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function NewPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Ambil user id dari session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError("Anda harus login untuk membuat postingan.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("posts").insert([
      {
        title,
        content,
        image_url: imageUrl || null,
        user_id: session.user.id,
      },
    ]);
    setLoading(false);
    if (error) setError(error.message);
    else router.push("/posts");
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gradient-to-b from-green-100 to-white">
      <div className="w-full max-w-md bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Buat Postingan Baru</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Judul"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="border p-2 rounded"
          />
          <textarea
            placeholder="Isi postingan"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            className="border p-2 rounded min-h-[100px]"
          />
          <input
            type="url"
            placeholder="URL Gambar (opsional)"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            className="border p-2 rounded"
          />
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Posting"}
            </button>
            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              onClick={() => router.push("/posts")}
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 