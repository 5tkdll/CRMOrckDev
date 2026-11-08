import Link from "next/link";
export default function NotFound() { return <section className="panel"><h1>Empresa não encontrada</h1><p>O identificador é inválido ou o cadastro não está disponível.</p><Link href="/empresas">Voltar às empresas</Link></section>; }
