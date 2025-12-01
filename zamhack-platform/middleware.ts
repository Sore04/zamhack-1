import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "@/types/supabase";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = ["/dashboard", "/company", "/admin"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Define public routes that should redirect if logged in
  const publicRoutes = ["/login", "/signup"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // If user is not logged in and trying to access protected route
  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in
  if (user) {
    // Fetch user profile to get role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    // If on public route (login/signup), redirect to appropriate dashboard
    if (isPublicRoute) {
      if (role === "student") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } else if (role === "company_admin" || role === "company_member") {
        return NextResponse.redirect(new URL("/company/dashboard", request.url));
      } else if (role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      // If no role, redirect to dashboard as default
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Role-based route protection - only redirect if user is on wrong route
    if (pathname.startsWith("/dashboard")) {
      // Only students should access /dashboard
      if (role && role !== "student") {
        if (role === "company_admin" || role === "company_member") {
          return NextResponse.redirect(
            new URL("/company/dashboard", request.url)
          );
        } else if (role === "admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
      }
    } else if (pathname.startsWith("/company")) {
      // Only company_admin and company_member should access /company
      if (role && role !== "company_admin" && role !== "company_member") {
        if (role === "student") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        } else if (role === "admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
        // If no role, redirect to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } else if (pathname.startsWith("/admin")) {
      // Only admin should access /admin
      if (role && role !== "admin") {
        if (role === "student") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        } else if (role === "company_admin" || role === "company_member") {
          return NextResponse.redirect(
            new URL("/company/dashboard", request.url)
          );
        }
        // If no role, redirect to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

