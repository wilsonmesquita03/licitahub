"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodOptional } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Column, PricingTableField } from "./pricing-table-field";

type BaseField = {
  name: string;
  label: string;
  required?: boolean;
};

type TextField = BaseField & {
  type: "text" | "number" | "textarea" | "email" | "checkbox";
};

type SelectField = BaseField & {
  type: "select";
  options: string[];
  initial: { [key: string]: any }[];
  editable?: boolean;
};

type PricingTableField = BaseField & {
  type: "pricing_table";
  columns: Column[];
};

export type FormField = TextField | SelectField | PricingTableField;

type DynamicFormProps = {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
};

export function DynamicForm({ fields, onSubmit }: DynamicFormProps) {
  const form = useForm();

  const { handleSubmit, register, setValue } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field) => {
        switch (field.type) {
          case "text":
          case "email":
          case "number":
            return (
              <div key={field.name}>
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  type={field.type}
                  id={field.name}
                  {...register(field.name, { required: field.required })}
                />
              </div>
            );

          case "textarea":
            return (
              <div key={field.name}>
                <Label htmlFor={field.name}>{field.label}</Label>
                <Textarea id={field.name} {...register(field.name)} />
              </div>
            );

          case "checkbox":
            return (
              <div key={field.name} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={field.name}
                  {...register(field.name)}
                />
                <Label htmlFor={field.name}>{field.label}</Label>
              </div>
            );

          case "pricing_table":
            return (
              <div key={field.name}>
                <PricingTableField
                  name={field.name}
                  columns={field.columns}
                  initial={[]}
                  onChange={(value) => setValue(field.name, value)}
                />
              </div>
            );

          case "select":
            return (
              <div key={field.name}>
                <Label htmlFor={field.name}>{field.label}</Label>
                <Select onValueChange={(value) => setValue(field.name, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );

          default:
            return null;
        }
      })}

      <Button type="submit">Enviar</Button>
    </form>
  );
}
