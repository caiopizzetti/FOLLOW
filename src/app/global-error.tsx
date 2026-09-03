"use client";

/**
 * Rede de segurança para erros que estouram no próprio layout raiz.
 * Precisa renderizar <html> e <body> porque substitui o layout inteiro.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          background: "#f6f7f9",
          color: "#101828",
        }}
      >
        <div style={{ maxWidth: 480, padding: 32, textAlign: "center" }}>
          <h1 style={{ fontSize: 18, fontWeight: 600 }}>Algo quebrou na aplicação</h1>
          <p style={{ marginTop: 8, color: "#475467", fontSize: 14 }}>{error.message}</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "8px 14px",
              borderRadius: 8,
              border: 0,
              background: "#4338ca",
              color: "#fff",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Tentar de novo
          </button>
        </div>
      </body>
    </html>
  );
}
