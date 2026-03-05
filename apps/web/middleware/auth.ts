export default defineNuxtRouteMiddleware((to) => {
  const { user, loading } = useAuth();

  const publicPages = ['/', '/login', '/pricing'];

  if (publicPages.includes(to.path)) return;

  if (!loading.value && !user.value) {
    return navigateTo('/login');
  }
});
