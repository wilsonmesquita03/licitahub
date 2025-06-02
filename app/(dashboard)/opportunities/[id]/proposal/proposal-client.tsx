// app/proposal/[id]/ProposalClient.tsx
"use client";

import { Loader, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const messages = [
  "🔧 Preparando os documentos secretos...",
  "📄 Formatando campos invisíveis...",
  "🧙‍♂️ Consultando os sábios do sistema...",
  "⏳ Girando engrenagens mágicas...",
  "✨ Invocando o template perfeito...",
  "🤖 Falando com a IA que escreve PDFs...",
  "📬 Enviando pombos-correio digitais...",
  "💡 Acendendo as luzes do escritório virtual...",
];

export default function ProposalClient({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<any | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(`/api/proposal-template/${id}`);
      const data = await res.json();
      setTemplate(data?.template || null);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Preparando sua proposta...</h2>
        <Loader2 className="animate-spin" />
        <p className="text-lg animate-pulse transition-opacity duration-500">
          {messages[messageIndex]}
        </p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-semibold mb-4">
          Ainda não temos um template
        </h2>
        <p>Tente novamente mais tarde ou entre em contato com o suporte.</p>
      </div>
    );
  }

  return (
    <div>📝 Tela com os campos para o usuário preencher e baixar o PDF</div>
  );
}
