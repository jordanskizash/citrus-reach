// middleware.ts
import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhook(.*)",
    "/blog/(.*)",
    "/preview/(.*)",
    "/homepage/(.*)",
    "/profile/(.*)"
  ],
  
  ignoredRoutes: [
    "/api/webhook(.*)",
    "/api/edgestore/(.*)",  // Ignore all EdgeStore routes
    "/api/edgestore/init"   // Specifically ignore the init route
  ]
});
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};