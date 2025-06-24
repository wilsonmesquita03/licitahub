"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Loader2, Copy, FileDown, RefreshCw, Trash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProposalData } from "@/types/proposal";
import { generateProposalDoc } from "@/lib/utils";
import pdfMake, { TCreatedPdf } from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import PDFPreview from "@/components/pdf-preview";

pdfMake.vfs = pdfFonts.vfs;

const formatToBRL = (value: number) => {
  const number = value;
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const parseBRLToFloat = (value: string) => {
  const clean = value.replace(/[^\d]/g, "");
  return parseFloat(clean) / 100 || 0;
};

export default function PropostasPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposal, setProposal] = useState<TCreatedPdf | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProposalData>({
    defaultValues: {
      biddingNumber: "PREGÃO ELETRÔNICO Nº 22/2025",
      company: {
        companyName: "ACME Soluções Técnicas LTDA",
        cnpj: "12.345.678/0001-99",
        stateRegistration: "123.456.789.000",
        address: "Av. das Inovações, 1234 - Centro, São Paulo - SP, 01000-000",
        email: "contato@acmesolucoes.com.br",
        phone: "(11) 1234-5678",
        bankDetails:
          "Banco do Brasil, Agência: 0001-2, Conta Corrente: 12345-6",
      },
      representative: {
        name: "João da Silva",
        nationality: "Brasileira",
        birthPlace: "São Paulo - SP",
        maritalStatus: "Casado",
        occupation: "Diretor Executivo",
        cpf: "123.456.789-00",
        rg: "12.345.678-9",
        rgIssuer: "SSP/SP",
        address: "Rua dos Líderes, 456 - Jardim das Empresas, São Paulo - SP",
        email: "joao.silva@acmesolucoes.com.br",
        phone: "(11) 98765-4321",
      },
      items: [
        {
          item: "1",
          description: "Serviço de manutenção preventiva em servidores",
          quantity: 10,
          unitPrice: 500.0,
          totalPrice: "R$ 5.000,00",
        },
        {
          item: "2",
          description: "Licença anual de software de segurança",
          quantity: 5,
          unitPrice: 1200.0,
          totalPrice: "R$ 6.000,00",
        },
      ],
      validity: "60 dias",
      locationAndDate: "São Paulo - SP, 2 de junho de 2025.",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });


  const onSubmit = async (data: ProposalData) => {
    setIsGenerating(true);
    try {
      const proposalDoc = await generateProposalDoc(data);
      const pdfDocGenerator = pdfMake.createPdf(proposalDoc);
      // @ts-ignore
      // @ts-nocheck
      setPdfUrl(await pdfDocGenerator.getDataUrl());

      setProposal(pdfDocGenerator);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    reset();
    setProposal(null);
  };

  return (
    <div className="container p-8 mx-auto">
      <div className="mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Montador de Propostas</h1>
          <p className="text-muted-foreground">
            Gere propostas técnicas e comerciais para licitações
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Dados da Proposta</CardTitle>
              <CardDescription>
                Preencha as informações para gerar sua proposta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Cabeçalho e info geral */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="letterhead">Timbrado (opcional)</Label>
                      <Input type="file" {...register("letterhead")} />
                    </div>
                    <div>
                      <Label htmlFor="biddingNumber">Número do Pregão</Label>
                      <Input
                        id="biddingNumber"
                        {...register("biddingNumber", {
                          required: "Campo obrigatório",
                        })}
                        aria-invalid={errors.biddingNumber ? "true" : "false"}
                      />
                      {errors.biddingNumber && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.biddingNumber.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="validity">Validade</Label>
                      <Input
                        id="validity"
                        {...register("validity", {
                          required: "Campo obrigatório",
                        })}
                        placeholder="Ex: 60 dias"
                        aria-invalid={errors.validity ? "true" : "false"}
                      />
                      {errors.validity && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.validity.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="locationAndDate">Local e Data</Label>
                      <Input
                        id="locationAndDate"
                        {...register("locationAndDate", {
                          required: "Campo obrigatório",
                        })}
                        placeholder="Ex: Nazarezinho - PB, 10 de junho de 2025."
                        aria-invalid={errors.locationAndDate ? "true" : "false"}
                      />
                      {errors.locationAndDate && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.locationAndDate.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Dados da Empresa */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dados da Empresa</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company.companyName">Razão Social</Label>
                      <Input
                        id="company.companyName"
                        {...register("company.companyName", {
                          required: "Campo obrigatório",
                        })}
                        aria-invalid={
                          errors.company?.companyName ? "true" : "false"
                        }
                      />
                      {errors.company?.companyName && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.company.companyName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="company.cnpj">CNPJ</Label>
                      <Input
                        id="company.cnpj"
                        {...register("company.cnpj", {
                          required: "Campo obrigatório",
                        })}
                        aria-invalid={errors.company?.cnpj ? "true" : "false"}
                      />
                      {errors.company?.cnpj && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.company.cnpj.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="company.stateRegistration">
                        Inscrição Estadual
                      </Label>
                      <Input
                        id="company.stateRegistration"
                        {...register("company.stateRegistration")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company.address">Endereço</Label>
                      <Input
                        id="company.address"
                        {...register("company.address")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company.email">E-mail</Label>
                      <Input
                        type="email"
                        id="company.email"
                        {...register("company.email", {
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Email inválido",
                          },
                        })}
                        aria-invalid={errors.company?.email ? "true" : "false"}
                      />
                      {errors.company?.email && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.company.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="company.phone">Telefone</Label>
                      <Input
                        id="company.phone"
                        {...register("company.phone")}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="company.bankDetails">
                        Dados Bancários
                      </Label>
                      <Textarea
                        id="company.bankDetails"
                        {...register("company.bankDetails")}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Representante Legal */}
                <Card>
                  <CardHeader>
                    <CardTitle>Representante Legal</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="representative.name">Nome</Label>
                      <Input
                        id="representative.name"
                        {...register("representative.name", {
                          required: "Campo obrigatório",
                        })}
                        aria-invalid={
                          errors.representative?.name ? "true" : "false"
                        }
                      />
                      {errors.representative?.name && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.representative.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="representative.nationality">
                        Nacionalidade
                      </Label>
                      <Input
                        id="representative.nationality"
                        {...register("representative.nationality")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="representative.birthPlace">
                        Naturalidade
                      </Label>
                      <Input
                        id="representative.birthPlace"
                        {...register("representative.birthPlace")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="representative.maritalStatus">
                        Estado Civil
                      </Label>
                      <Input
                        id="representative.maritalStatus"
                        {...register("representative.maritalStatus")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="representative.occupation">
                        Profissão
                      </Label>
                      <Input
                        id="representative.occupation"
                        {...register("representative.occupation")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="representative.cpf">CPF</Label>
                      <Input
                        id="representative.cpf"
                        {...register("representative.cpf", {
                          required: "Campo obrigatório",
                        })}
                        aria-invalid={
                          errors.representative?.cpf ? "true" : "false"
                        }
                      />
                      {errors.representative?.cpf && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.representative.cpf.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="representative.rg">RG</Label>
                      <Input
                        id="representative.rg"
                        {...register("representative.rg")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="representative.rgIssuer">
                        Órgão Emissor RG
                      </Label>
                      <Input
                        id="representative.rgIssuer"
                        {...register("representative.rgIssuer")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="representative.address">Endereço</Label>
                      <Input
                        id="representative.address"
                        {...register("representative.address")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="representative.email">E-mail</Label>
                      <Input
                        type="email"
                        id="representative.email"
                        {...register("representative.email", {
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Email inválido",
                          },
                        })}
                        aria-invalid={
                          errors.representative?.email ? "true" : "false"
                        }
                      />
                      {errors.representative?.email && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.representative.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="representative.phone">Telefone</Label>
                      <Input
                        id="representative.phone"
                        {...register("representative.phone")}
                      />
                    </div>
                  </CardContent>
                </Card>
                {/* Itens da Proposta */}
                <Card>
                  <CardHeader>
                    <CardTitle>Itens da Proposta</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      onClick={() =>
                        append({
                          item: String(fields.length + 1),
                          description: "",
                          unity: "",
                          quantity: 0,
                          unitPrice: 0,
                          totalPrice: "R$ 0,00",
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Item
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fields.map((field, index) => {
                      return (
                        <Card key={field.id} className="relative">
                          <CardHeader>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => remove(index)}
                              aria-label="Remover item"
                            >
                              <Trash className="h-4 w-4 text-red-600" />
                            </Button>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                              {/* Item e Descrição (largos) */}
                              <div className="lg:col-span-2 space-y-2 hidden">
                                <Label htmlFor={`items.${index}.item`}>
                                  Item
                                </Label>
                                <Input
                                  id={`items.${index}.item`}
                                  {...register(`items.${index}.item`)}
                                />
                              </div>

                              <div className="lg:col-span-2 space-y-2">
                                <Label htmlFor={`items.${index}.description`}>
                                  Descrição
                                </Label>
                                <Input
                                  id={`items.${index}.description`}
                                  {...register(`items.${index}.description`)}
                                />
                              </div>

                              <div className="lg:col-span-2 space-y-2">
                                <Label htmlFor={`items.${index}.unity`}>
                                  Unidade
                                </Label>
                                <Input
                                  id={`items.${index}.unity`}
                                  placeholder="caixa"
                                  {...register(`items.${index}.unity`)}
                                />
                              </div>

                              <div className="lg:col-span-2 space-y-2">
                                <Label htmlFor={`items.${index}.quantity`}>
                                  Quantidade
                                </Label>
                                <Input
                                  type="number"
                                  step="any"
                                  id={`items.${index}.quantity`}
                                  value={watch(`items.${index}.quantity`)}
                                  min={1}
                                  onChange={(e) => {
                                    const quantity = Number(e.target.value);
                                    const unitPrice = watch(
                                      `items.${index}.unitPrice`
                                    );

                                    const total = unitPrice * quantity;

                                    setValue(
                                      `items.${index}.quantity`,
                                      quantity
                                    );

                                    setValue(
                                      `items.${index}.totalPrice`,
                                      formatToBRL(total)
                                    );
                                  }}
                                />
                              </div>

                              {/* Valor Unitário e Total lado a lado */}
                              <div className="lg:col-span-3 space-y-2">
                                <Label htmlFor={`items.${index}.unitPrice`}>
                                  Valor Unitário
                                </Label>
                                <Input
                                  id={`items.${index}.unitPrice`}
                                  inputMode="numeric"
                                  placeholder="R$ 0,00"
                                  value={formatToBRL(
                                    watch(`items.${index}.unitPrice`) || 0
                                  )}
                                  onChange={(e) => {
                                    const unitPrice = Number(
                                      parseBRLToFloat(e.target.value)
                                    );
                                    const quantity = watch(
                                      `items.${index}.quantity`
                                    );

                                    const total = unitPrice * quantity;

                                    setValue(
                                      `items.${index}.unitPrice`,
                                      unitPrice
                                    );

                                    setValue(
                                      `items.${index}.totalPrice`,
                                      formatToBRL(total)
                                    );
                                  }}
                                  aria-invalid={
                                    errors.items?.[index]?.unitPrice
                                      ? "true"
                                      : "false"
                                  }
                                />
                                {errors.items?.[index]?.unitPrice && (
                                  <p className="text-red-600 text-sm mt-1">
                                    {errors.items[index]?.unitPrice?.message}
                                  </p>
                                )}
                              </div>

                              <div className="lg:col-span-3 space-y-2">
                                <Label>Valor Total</Label>
                                <Input
                                  disabled={true}
                                  readOnly={true}
                                  value={watch(`items.${index}.totalPrice`)}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Botões principais */}
                <div className="flex gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Limpar
                  </Button>
                  <Button type="submit" disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      "Gerar Proposta"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Prévia da Proposta */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Prévia da Proposta</CardTitle>
              <CardDescription>
                Visualize e exporte o texto gerado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : proposal ? (
                <>
                  <div className="prose prose-sm max-w-none mb-4 rounded-lg">
                    <PDFPreview pdfUrl={pdfUrl || ""} />
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={() => proposal.download()}>
                      <FileDown className="mr-2 h-4 w-4" />
                      Exportar PDF
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Preencha o formulário e clique em &quot;Gerar Proposta&quot;
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
