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
  user_id: string;
  profiles?: {
    email?: string;
    username?: string;
    avatar_url?: string;
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
        .order("created_at", { ascending: false });
      setPosts((postsData || []).map((p: any) => ({ 
        ...p, 
        profiles: p.profiles 
      })));
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
    <div className="flex flex-col items-center min-h-screen p-8 gap-8 bg-gradient-to-b from-green-200 via-blue-100 to-white font-sans relative overflow-hidden">
      {/* Ornamen awan */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-white opacity-40 rounded-full blur-2xl -z-10" style={{top: '-60px', left: '-60px'}} />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-blue-100 opacity-30 rounded-full blur-2xl -z-10" style={{bottom: '-80px', right: '-80px'}} />
      <div className="flex w-full justify-between items-center max-w-2xl mb-2">
        <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight flex items-center gap-2">
          <img src="/mountain.svg" alt="Gunung" width={36} height={36} className="inline-block drop-shadow animate-bounce-slow" />
          Postingan Gunung Agung
        </h1>
        <button
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-5 py-2 rounded-xl shadow hover:scale-105 hover:from-green-600 hover:to-blue-700 transition-all font-semibold text-base border-2 border-blue-200"
          onClick={() => router.push("/posts/new")}
        >
          + Buat Postingan
        </button>
      </div>
      <div className="w-full max-w-2xl flex flex-col gap-8">
        {posts.length === 0 && <div className="text-center text-gray-500">Belum ada postingan.</div>}
        {posts.map(post => (
          <div key={post.id} className="bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col gap-3 hover:shadow-2xl transition group border border-blue-50">
            <h2 className="text-2xl font-bold text-blue-800 group-hover:underline mb-1">{post.title}</h2>
            <p className="text-base text-gray-700 mb-1 whitespace-pre-line">{post.content}</p>
            {post.image_url && (
              <img src={post.image_url} alt={post.title} className="max-h-64 object-contain rounded-xl border border-blue-100 mb-2" />
            )}
            <div className="text-xs text-gray-500 flex gap-2 items-center mb-2">
              <div className="flex items-center gap-2">
                <img
                  src={post.profiles?.avatar_url || "/file.svg"}
                  alt="Avatar penulis"
                  className="w-6 h-6 rounded-full object-cover border border-blue-200"
                />
                <span>
                  Oleh: <span className="font-semibold text-blue-700">
                    {post.profiles?.username || post.profiles?.email || 'Anonim'}
                  </span>
                </span>
              </div>
              <span>•</span>
              <span>{new Date(post.created_at).toLocaleString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            {user && (
              <div className="flex gap-2 mt-1">
                {user.id === post.user_id && (
                  <button
                    className="bg-yellow-400 text-white px-3 py-1 rounded-lg hover:bg-yellow-500 transition font-semibold"
                    onClick={() => router.push(`/posts/${post.id}/edit`)}
                  >
                    Edit
                  </button>
                )}
                {(user.id === post.user_id || user.role === 'admin' || user.role === 'super_admin') && (
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition font-semibold"
                    onClick={async () => {
                      if (confirm('Yakin ingin menghapus postingan ini?')) {
                        await supabase.from('posts').delete().eq('id', post.id);
                        setPosts(posts.filter(p => p.id !== post.id));
                      }
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
            {/* Komentar */}
            <div className="border-t pt-4 mt-3">
              <h3 className="font-semibold mb-2 text-blue-700">Komentar</h3>
              {(commentsMap[post.id]?.length === 0 || !commentsMap[post.id]) && <div className="text-gray-400">Belum ada komentar.</div>}
              <div className="flex flex-col gap-3">
                {(commentsMap[post.id] || []).map((c) => (
                  <div key={c.id} className="flex gap-3 items-start">
                    <img
                      src={c.profiles?.avatar_url || "/file.svg"}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 bg-gray-100 mt-1"
                    />
                    <div className="flex-1 bg-blue-50 rounded-xl px-4 py-2 shadow-sm">
                      <div className="font-semibold text-blue-700 text-sm">{c.profiles?.username || c.profiles?.email || 'Anonim'}</div>
                      <div className="text-xs text-gray-400 mb-1">{new Date(c.created_at).toLocaleString()}</div>
                      <div className="text-gray-700 whitespace-pre-line text-base">{c.content}</div>
                    </div>
                  </div>
                ))}
              </div>
              {user && (
                <form onSubmit={e => handleCommentSubmit(e, post.id)} className="flex flex-col gap-2 mt-4">
                  <textarea
                    className="border rounded-lg p-2 min-h-[40px] text-base focus:ring-2 focus:ring-blue-200"
                    placeholder="Tulis komentar..."
                    value={commentInputs[post.id] || ""}
                    onChange={e => handleCommentChange(post.id, e.target.value)}
                    disabled={commentLoading[post.id]}
                  />
                  {errorMap[post.id] && <div className="text-red-500 text-xs">{errorMap[post.id]}</div>}
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition font-semibold self-end"
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