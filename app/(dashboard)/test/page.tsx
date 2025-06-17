"use client";
import { DynamicForm, FormField } from "@/components/dynamic-form";
export type Field =
  | {
      name: string;
      label: string;
      type: "text" | "number" | "email";
      required?: boolean;
    }
  | { name: string; label: string; type: "textarea"; required?: boolean }
  | {
      name: string;
      label: string;
      type: "select";
      options: string[];
      required?: boolean;
    };

export default function App() {
  const fieldsFromAI: FormField[] = [
    {
      name: "nome_completo",
      label: "Nome Completo",
      type: "text",
      required: true,
    },
    {
      name: "data_nascimento",
      label: "Data de Nascimento",
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "Endereço de E-mail",
      type: "email",
      required: true,
    },
    {
      name: "telefone",
      label: "Número de Telefone",
      type: "text",
      required: true,
    },
    {
      name: "instituicao_ensino",
      label: "Instituição de Ensino",
      type: "text",
      required: true,
    },
    {
      name: "documento_identidade",
      label: "Documento de Identidade (RG ou CPF)",
      type: "text",
      required: true,
    },
    {
      name: "redacao_submetida",
      label: "Redação Submetida",
      type: "textarea",
      required: true,
    },
    {
      name: "pricing_table",
      label: "Tabela de Precificação",
      type: "pricing_table",
      columns: [
        { key: "item", label: "Item", type: "text" },
        { key: "quantidade", label: "Qtd", type: "number" },
        { key: "preco_unitario", label: "Preço Unitário", type: "price" },
      ],
    },
  ];

  function handleFormSubmit(data: any) {
    console.log("Formulário enviado:", data);
  }

  return (
    <main className="mx-auto mt-10 p-4">
      <DynamicForm fields={fieldsFromAI} onSubmit={handleFormSubmit} />
    </main>
  );
}
