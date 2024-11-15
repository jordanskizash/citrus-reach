import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhook(.*)",
    "/blog",           // Base blog route
    "/blog/(.*)",      // All nested blog routes
    "/about",          // Adding about page
    "/preview/(.*)",
    "/homepage/(.*)",
    "/profile/(.*)",
    "/terms-of-service",
    "/privacy-policy"
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