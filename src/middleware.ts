import {
  clerkMiddleware,
  createClerkClient,
  createRouteMatcher,
} from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

async function fetchUser(userId: string) {
  const clerkClient = await createClerkClient({
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  });
  const user = await clerkClient.users.getUser(userId);
  return { ...user, role: "user" }; // Assuming default role is "user"
}

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return Response.redirect(new URL("/unauthorized", req.url));
    }
  }

  if (isAdminRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return Response.redirect(new URL("/unauthorized", req.url));
    }
    const user = await fetchUser(userId);
    if (user?.role !== "admin") {
      return Response.redirect(new URL("/unauthorized", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
