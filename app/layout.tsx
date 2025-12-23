import type { Metadata } from "next";
import "./globals.css";

// Initialize worker on server startup (safely)
if (typeof window === "undefined") {
  // Importação dinâmica com tratamento de erro robusto
  import("@/lib/queue/init").catch((error) => {
    console.error("❌ Erro ao inicializar worker:", error);
    if (error instanceof Error) {
      console.error("Stack:", error.stack);
    }
    // Não bloquear o servidor se o worker falhar
  });
}

export const metadata: Metadata = {
  title: "PDV Roma",
  description: "Sistema de gestão de carregamentos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
