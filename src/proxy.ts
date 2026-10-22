import { clerkMiddleware } from "@clerk/nextjs/server";

/*
 * Next.js 16 renamed the `middleware` convention to `proxy`.
 * Clerk attaches the session to every matched request and /admin is gated
 * before it renders, which keeps the admin shell prerenderable under
 * `cacheComponents`. Once admin pages read private Supabase data, move the
 * check into those routes (`await auth.protect()`) so authorization sits with
 * the data rather than the path.
 */
export default clerkMiddleware(async (auth, request) => {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Everything except Next internals and static files, unless used in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
