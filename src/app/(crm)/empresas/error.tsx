"use client";
export default function CompaniesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="panel"><h1>Não foi possível carregar as empresas</h1><p>Confira a conexão com o banco. Nenhuma credencial é exibida nesta tela.</p><button type="button" onClick={reset}>Tentar novamente</button></section>;
}
