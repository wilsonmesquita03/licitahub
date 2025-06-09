import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// Função para checar se o caminho é público
function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permite rotas de arquivo (ex: _next, favicon.ico etc)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // arquivos estáticos (ex: .css, .js, .png)
  ) {
    return NextResponse.next();
  }

  // Se for rota pública, libera acesso
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(req);

  if (!sessionCookie) {
    // Usuário não está logado, redireciona para login
    const loginUrl = new URL("/login", req.url);
    // Se quiser pode guardar a URL atual para redirecionar depois do login
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (sessionCookie && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Usuário está logado, libera acesso
  return NextResponse.next();
}

// Configura o matcher para todas rotas
export const config = {
  matcher: "/((?!_next|api|favicon.ico).*)",
};
