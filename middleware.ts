import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
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
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session — do not remove this
    const { data: { user } } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Block /portal/setup entirely in production — it was a one-time setup utility
    if (pathname.startsWith('/portal/setup')) {
        const notFoundUrl = request.nextUrl.clone();
        notFoundUrl.pathname = '/portal/login';
        return NextResponse.redirect(notFoundUrl);
    }

    // Protect all /portal/eb/* routes — redirect to login if not authenticated
    if (pathname.startsWith('/portal/eb') && !user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/portal/login';
        loginUrl.searchParams.set('redirected', 'true');
        return NextResponse.redirect(loginUrl);
    }

    // If already logged in, redirect away from login page
    if (pathname === '/portal/login' && user) {
        const ebUrl = request.nextUrl.clone();
        ebUrl.pathname = '/portal/eb';
        return NextResponse.redirect(ebUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/portal/eb/:path*',
        '/portal/login',
        '/portal/setup',
    ],
};
