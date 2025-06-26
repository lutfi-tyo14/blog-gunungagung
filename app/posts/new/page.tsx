"use client";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";

export default function NewPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${session.user.id}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("post-images")
      .upload(fileName, imageFile, { upsert: true });
    if (error) {
      setError("Gagal upload gambar: " + error.message);
      return null;
    }
    const { data: publicUrl } = supabase.storage.from("post-images").getPublicUrl(fileName);
    return publicUrl?.publicUrl || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError("Anda harus login untuk membuat postingan.");
      setLoading(false);
      return;
    }
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadImage();
      if (!imageUrl) {
        setLoading(false);
        return;
      }
    }
    const { error } = await supabase.from("posts").insert([
      {
        title,
        content,
        image_url: imageUrl,
        user_id: session.user.id,
      },
    ]);
    setLoading(false);
    if (error) setError(error.message);
    else router.push("/posts");
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gradient-to-b from-green-200 via-blue-100 to-white font-sans relative overflow-hidden">
      {/* Ornamen awan */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-white opacity-40 rounded-full blur-2xl -z-10" style={{top: '-60px', left: '-60px'}} />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-blue-100 opacity-30 rounded-full blur-2xl -z-10" style={{bottom: '-80px', right: '-80px'}} />
      <div className="w-full max-w-md bg-white/90 rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
          <Image src="/mountain.svg" alt="Gunung" width={28} height={28} className="inline-block drop-shadow animate-bounce-slow" />
          Buat Postingan Baru
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Judul"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="border p-2 rounded-lg"
          />
          <textarea
            placeholder="Isi postingan"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            className="border p-2 rounded-lg min-h-[100px]"
          />
          <label className="flex flex-col gap-2">
            <span className="font-semibold">Gambar (opsional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border p-2 rounded-lg"
            />
            {imagePreview && (
              <Image 
                src={imagePreview} 
                alt="Preview" 
                width={600}
                height={400}
                className="w-full max-h-60 object-contain rounded-lg border mt-2" 
              />
            )}
          </label>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Posting"}
            </button>
            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
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