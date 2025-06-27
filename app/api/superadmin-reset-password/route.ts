import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Supabase service role key for admin actions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only create admin client if both environment variables are available
const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(req: NextRequest) {
  try {
    // Check if admin client is available
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const { email, newPassword } = await req.json();
    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email dan password baru wajib diisi.' }, { status: 400 });
    }

    // --- AUTH: Check if requester is super admin ---
    // (Assume session JWT is sent in Authorization header as Bearer token)
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const jwt = authHeader.replace('Bearer ', '');
    // Validate JWT and get user info
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);
    if (userError || !user) {
      return NextResponse.json({ error: 'Session tidak valid.' }, { status: 401 });
    }
    // Check role in profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profileError || !profile || profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Hanya super admin yang boleh reset password.' }, { status: 403 });
    }

    // --- Update password for target user ---
    // Get user by email
    const { data: targetUser, error: targetUserError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    if (targetUserError || !targetUser) {
      return NextResponse.json({ error: 'User dengan email tersebut tidak ditemukan.' }, { status: 404 });
    }
    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUser.id, { password: newPassword });
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Password berhasil direset untuk user tersebut.' });
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
} 