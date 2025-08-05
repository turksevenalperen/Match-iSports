import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                      req.nextUrl.pathname.startsWith('/register')
    const isRootPage = req.nextUrl.pathname === '/'

    // Eğer kullanıcı giriş yapmış ve auth sayfasında ise dashboard'a yönlendir
    if (isAuth && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Eğer kullanıcı giriş yapmış ve ana sayfada ise dashboard'a yönlendir
    if (isAuth && isRootPage) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Eğer kullanıcı giriş yapmamış ve ana sayfada ise hiçbir şey yapma (ana sayfa göster)
    if (!isAuth && isRootPage) {
      return NextResponse.next()
    }

    // Eğer kullanıcı giriş yapmamış ve korumalı sayfada ise login'e yönlendir
    if (!isAuth && !isAuthPage && !isRootPage) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Ana sayfa, login ve register sayfalarına herkesi al
        if (req.nextUrl.pathname === '/' || 
            req.nextUrl.pathname.startsWith('/login') || 
            req.nextUrl.pathname.startsWith('/register')) {
          return true
        }
        // Diğer sayfalar için token gerekli
        return !!token
      }
    },
  }
)

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/profile/:path*", 
    "/teams/:path*",
    "/matches/:path*",
    "/chat/:path*",
    "/login",
    "/register"
  ]
}
