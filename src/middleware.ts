import type { NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { response } = await updateSession(request)
  // A proteção das rotas do sistema (redirecionar para /login) entra na Fase 2.
  return response
}

export const config = {
  matcher: [
    // Tudo, exceto arquivos estáticos, imagens e metadados.
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
