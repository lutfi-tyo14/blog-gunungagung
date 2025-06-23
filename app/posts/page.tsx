"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

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

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles?: {
    username?: string;
    email?: string;
    avatar_url?: string;
  };
}

export default function PostsLanding() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    const getSessionAndPosts = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/");
        return;
      }
      // Ambil role user dari profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.session.user.id)
        .single();
      setUser({ ...data.session.user, role: profile?.role || "user" });
      // Fetch posts with author info
      const { data: postsData } = await supabase
        .from("posts")
        .select("id, title, content, image_url, created_at, profiles:profiles(email,username)")
        .order("created_at", { ascending: false });
      setPosts(postsData || []);
      // Fetch comments for all posts
      if (postsData && postsData.length > 0) {
        const postIds = postsData.map((p: Post) => p.id);
        const { data: allComments } = await supabase
          .from("comments")
          .select("id, content, created_at, post_id, profiles:profiles(username,email,avatar_url)")
          .in("post_id", postIds);
        const map: Record<string, Comment[]> = {};
        (allComments || []).forEach((c: any) => {
          if (!map[c.post_id]) map[c.post_id] = [];
          map[c.post_id].push(c);
        });
        setCommentsMap(map);
      }
      setLoading(false);
    };
    getSessionAndPosts();
  }, [router]);

  const handleCommentChange = (postId: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleCommentSubmit = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    setErrorMap((prev) => ({ ...prev, [postId]: "" }));
    setCommentLoading((prev) => ({ ...prev, [postId]: true }));
    const comment = commentInputs[postId]?.trim();
    if (!comment) {
      setErrorMap((prev) => ({ ...prev, [postId]: "Komentar tidak boleh kosong." }));
      setCommentLoading((prev) => ({ ...prev, [postId]: false }));
      return;
    }
    if (!user) {
      setErrorMap((prev) => ({ ...prev, [postId]: "Anda harus login untuk berkomentar." }));
      setCommentLoading((prev) => ({ ...prev, [postId]: false }));
      return;
    }
    const { error, data } = await supabase.from("comments").insert([
      {
        post_id: postId,
        user_id: user.id,
        content: comment,
      },
    ]).select("id, content, created_at, profiles:profiles(username,email,avatar_url)").single();
    setCommentLoading((prev) => ({ ...prev, [postId]: false }));
    if (error) {
      setErrorMap((prev) => ({ ...prev, [postId]: error.message }));
    } else {
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data],
      }));
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="flex flex-col items-center min-h-screen p-8 gap-8 bg-gradient-to-b from-green-100 to-white">
      <div className="flex w-full justify-between items-center max-w-2xl">
        <h1 className="text-2xl font-bold">Postingan Gunung Agung</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => router.push("/posts/new")}
        >
          + Buat Postingan
        </button>
      </div>
      <div className="w-full max-w-2xl flex flex-col gap-6">
        {posts.length === 0 && <div className="text-center text-gray-500">Belum ada postingan.</div>}
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded shadow p-4 flex flex-col gap-2">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p>{post.content}</p>
            {post.image_url && (
              <img src={post.image_url} alt={post.title} className="max-h-60 object-contain rounded" />
            )}
            <div className="text-xs text-gray-500 flex gap-2 items-center">
              <span>Oleh: {post.profiles?.username || post.profiles?.email || 'Anonim'}</span>
              <span>•</span>
              <span>{new Date(post.created_at).toLocaleString()}</span>
            </div>
            {user && (post.profiles?.email === user.email || user.role === 'admin' || user.role === 'super_admin') && (
              <div className="flex gap-2 mt-2">
                {post.profiles?.email === user.email && (
                  <button
                    className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                    onClick={() => router.push(`/posts/${post.id}/edit`)}
                  >
                    Edit
                  </button>
                )}
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  onClick={async () => {
                    if (confirm('Yakin ingin menghapus postingan ini?')) {
                      await supabase.from('posts').delete().eq('id', post.id);
                      setPosts(posts.filter(p => p.id !== post.id));
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            )}
            {/* Komentar */}
            <div className="border-t pt-3 mt-3">
              <h3 className="font-semibold mb-2 text-blue-700">Komentar</h3>
              {(commentsMap[post.id]?.length === 0 || !commentsMap[post.id]) && <div className="text-gray-400">Belum ada komentar.</div>}
              <div className="flex flex-col gap-3">
                {(commentsMap[post.id] || []).map((c) => (
                  <div key={c.id} className="flex gap-3 items-start">
                    <img
                      src={c.profiles?.avatar_url || "/file.svg"}
                      alt="avatar"
                      className="w-7 h-7 rounded-full object-cover border border-blue-200 bg-gray-100 mt-1"
                    />
                    <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                      <div className="font-semibold text-blue-700 text-xs">{c.profiles?.username || c.profiles?.email || 'Anonim'}</div>
                      <div className="text-xs text-gray-400 mb-1">{new Date(c.created_at).toLocaleString()}</div>
                      <div className="text-gray-700 whitespace-pre-line text-sm">{c.content}</div>
                    </div>
                  </div>
                ))}
              </div>
              {user && (
                <form onSubmit={e => handleCommentSubmit(e, post.id)} className="flex flex-col gap-2 mt-3">
                  <textarea
                    className="border rounded p-2 min-h-[40px] text-sm"
                    placeholder="Tulis komentar..."
                    value={commentInputs[post.id] || ""}
                    onChange={e => handleCommentChange(post.id, e.target.value)}
                    disabled={commentLoading[post.id]}
                  />
                  {errorMap[post.id] && <div className="text-red-500 text-xs">{errorMap[post.id]}</div>}
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 self-end text-sm"
                    disabled={commentLoading[post.id]}
                  >
                    {commentLoading[post.id] ? "Mengirim..." : "Kirim"}
                  </button>
                </form>
              )}
              {!user && <div className="text-blue-600 mt-2 text-sm">Login untuk berkomentar.</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 