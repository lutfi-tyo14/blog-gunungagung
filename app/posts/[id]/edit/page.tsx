"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

export default function EditPost() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/");
        return;
      }
      // Ambil data postingan
      const { data: post, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();
      if (error || !post) {
        setError("Postingan tidak ditemukan.");
        setLoading(false);
        return;
      }
      // Cek hak akses
      if (post.user_id !== data.session.user.id) {
        setError("Anda tidak punya akses untuk mengedit postingan ini.");
        setLoading(false);
        return;
      }
      setTitle(post.title);
      setContent(post.content);
      setImageUrl(post.image_url || "");
      setLoading(false);
    };
    fetchData();
  }, [router, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error } = await supabase
      .from("posts")
      .update({ title, content, image_url: imageUrl })
      .eq("id", postId);
    if (error) setError(error.message);
    else router.push("/posts");
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gradient-to-b from-green-100 to-white">
      <div className="w-full max-w-md bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Edit Postingan</h1>
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
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Simpan
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