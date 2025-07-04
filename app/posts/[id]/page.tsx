"use client";
import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";

interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  profiles?: {
    email?: string;
    username?: string;
  };
}

interface CommentData {
  id: string;
  content: string;
  created_at: string;
  post_id: string;
  profiles?: {
    username?: string;
    email?: string;
    avatar_url?: string;
  };
}

interface UserSession {
  id: string;
  email?: string;
  role?: string;
}

function PostDetailContent() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [user, setUser] = useState<UserSession | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Cek session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
      // Ambil postingan
      const { data: post, error: postError } = await supabase
        .from("posts")
        .select(`
          id, 
          title, 
          content, 
          image_url, 
          created_at, 
          user_id,
          profiles!posts_user_id_fkey (
            email,
            username,
            avatar_url
          )
        `)
        .eq("id", postId)
        .single();
      
      if (postError || !post) {
        setError("Postingan tidak ditemukan.");
        setLoading(false);
        return;
      }
      
      setPost({ ...post, profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles });
      // Ambil komentar
      const { data: comments } = await supabase
        .from("comments")
        .select(`
          id, content, created_at, post_id,
          profiles:profiles(username,email,avatar_url)
        `)
        .eq("post_id", postId);
      setComments((comments || []).map((c: {
        id: string;
        content: string;
        created_at: string;
        post_id: string;
        profiles: {
          username?: string;
          email?: string;
          avatar_url?: string;
        } | {
          username?: string;
          email?: string;
          avatar_url?: string;
        }[];
      }) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        post_id: c.post_id,
        profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
      }) as CommentData));
      setLoading(false);
    };
    fetchData();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCommentLoading(true);
    if (!comment.trim()) {
      setError("Komentar tidak boleh kosong.");
      setCommentLoading(false);
      return;
    }
    if (!user) {
      setError("Anda harus login untuk berkomentar.");
      setCommentLoading(false);
      return;
    }
    const { error, data } = await supabase.from("comments").insert([
      {
        post_id: postId,
        user_id: user.id,
        content: comment,
      },
    ]).select("id, content, created_at, profiles:profiles(username,email,avatar_url)").single();
    setCommentLoading(false);
    if (error) setError(error.message);
    else {
      setComments([...comments, {
        id: data.id,
        content: data.content,
        created_at: data.created_at,
        post_id: postId,
        profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
      } as CommentData]);
      setComment("");
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!post) return <div className="flex justify-center items-center min-h-screen text-red-500">Postingan tidak ditemukan.</div>;

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gradient-to-b from-green-100 to-white">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6">
        <button className="text-blue-600 underline mb-2 self-start" onClick={() => router.push("/posts")}>← Kembali</button>
        <h1 className="text-3xl font-bold text-blue-700">{post.title}</h1>
        <div className="text-gray-500 text-sm mb-2">
          Oleh: {post.profiles?.username || post.profiles?.email || 'Anonim'} • {new Date(post.created_at).toLocaleString()}
        </div>
        {post.image_url && (
          <Image 
            src={post.image_url} 
            alt={post.title} 
            width={800}
            height={600}
            className="max-h-80 object-contain rounded mb-4 mx-auto" 
          />
        )}
        <p className="text-lg mb-4 whitespace-pre-line">{post.content}</p>
        <div className="border-t pt-4 mt-4">
          <h2 className="text-xl font-semibold mb-2">Komentar</h2>
          {comments.length === 0 && <div className="text-gray-400">Belum ada komentar.</div>}
          <div className="flex flex-col gap-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3 items-start">
                <Image
                  src={c.profiles?.avatar_url || "/file.svg"}
                  alt="avatar"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 bg-gray-100 mt-1"
                />
                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                  <div className="font-semibold text-blue-700 text-sm">{c.profiles?.username || c.profiles?.email || 'Anonim'}</div>
                  <div className="text-xs text-gray-400 mb-1">{new Date(c.created_at).toLocaleString()}</div>
                  <div className="text-gray-700 whitespace-pre-line">{c.content}</div>
                </div>
              </div>
            ))}
          </div>
          {user && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-6">
              <textarea
                className="border rounded p-2 min-h-[60px]"
                placeholder="Tulis komentar..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                disabled={commentLoading}
              />
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 self-end"
                disabled={commentLoading}
              >
                {commentLoading ? "Mengirim..." : "Kirim Komentar"}
              </button>
            </form>
          )}
          {!user && <div className="text-blue-600 mt-4">Login untuk berkomentar.</div>}
        </div>
      </div>
    </div>
  );
}

export default function PostDetail() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <PostDetailContent />
    </Suspense>
  );
} 