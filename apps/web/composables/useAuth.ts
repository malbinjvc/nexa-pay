import { createClient, type User, type Session } from '@supabase/supabase-js';

const user = ref<User | null>(null);
const session = ref<Session | null>(null);
const loading = ref(true);

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (supabase) return supabase;
  const config = useRuntimeConfig();
  supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey);
  return supabase;
}

export function useAuth() {
  function initAuth() {
    const config = useRuntimeConfig();
    if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
      loading.value = false;
      return;
    }

    const sb = getSupabase();

    sb.auth.getSession().then(({ data }) => {
      session.value = data.session;
      user.value = data.session?.user ?? null;
      loading.value = false;
    }).catch(() => {
      loading.value = false;
    });

    sb.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession;
      user.value = newSession?.user ?? null;
      loading.value = false;
    });
  }

  async function signInWithMagicLink(email: string) {
    const sb = getSupabase();
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) throw error;
  }

  async function signInWithOAuth(provider: 'google' | 'github') {
    const sb = getSupabase();
    const { error } = await sb.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) throw error;
  }

  async function signOut() {
    const sb = getSupabase();
    await sb.auth.signOut();
    user.value = null;
    session.value = null;
    navigateTo('/login');
  }

  return {
    user: readonly(user),
    session: readonly(session),
    loading: readonly(loading),
    initAuth,
    signInWithMagicLink,
    signInWithOAuth,
    signOut,
    getSupabase,
  };
}
