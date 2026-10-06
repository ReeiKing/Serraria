import { NextResponse, type NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const { pathname, search } = request.nextUrl

  // Área logada: sem sessão, vai para o login lembrando o destino.
  if (pathname.startsWith("/sistema") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.search = `?proximo=${encodeURIComponent(pathname + search)}`
    return NextResponse.redirect(url)
  }

  // Já logado: o login leva direto ao sistema.
  if (pathname === "/login" && user) {
    const url = request.nextUrl.clone()
    url.pathname = "/sistema"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    // Tudo, exceto arquivos estáticos, imagens e metadados.
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
