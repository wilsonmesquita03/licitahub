import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useState } from "react";

type ColumnType = "text" | "number" | "price";

export type Column<ItemKey extends keyof ItemRow = keyof ItemRow> = {
  key: ItemKey;
  label: string;
  type: ColumnType;
};

type ItemRow = { [key: string]: any };

const formatToBRL = (value: number): string => {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const parseBRLToFloat = (value: string): number => {
  const clean = value.replace(/\D/g, "");
  return Number(clean) / 100 || 0;
};

export function PricingTableField({
  name,
  onChange,
  columns,
  initial = [],
}: {
  name: string;
  onChange: (value: ItemRow[]) => void;
  columns: Column[];
  initial?: ItemRow[];
}) {
  const [rows, setRows] = useState<ItemRow[]>(initial);

  const updateRow = (
    index: number,
    key: keyof ItemRow,
    value: string | number
  ) => {
    const column = columns.find((col) => col.key === key);
    const updated = [...rows];

    let parsed: any = value;

    if (column?.type === "price") {
      parsed = parseBRLToFloat(value as string);
    } else if (column?.type === "number") {
      parsed = parseInt(value as string) || 0;
    }

    updated[index] = {
      ...updated[index],
      [key]: parsed,
    };

    updated[index].total =
      updated[index].quantidade * updated[index].preco_unitario;

    setRows(updated);
    onChange(updated);
  };

  const addRow = () => {
    const newRow: ItemRow = {};

    columns.forEach((col) => {
      newRow[col.key] = col.type === "number" || col.type === "price" ? 0 : "";
    });

    // Se quiser garantir que 'total' exista:
    newRow.total = 0;

    const updated = [...rows, newRow];
    setRows(updated);
    onChange(updated);
  };

  const removeRow = (index: number) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
    onChange(updated);
  };

  const totalGeral = rows.reduce((sum, row) => sum + row.total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabela de Itens</CardTitle>
        <CardDescription>Adicione itens aqui</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                {columns.map((col) => (
                  <th key={col.key as string} className="p-2">
                    {col.label}
                  </th>
                ))}
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border">
                  {columns.map((col) => {
                    const colValue = row[col.key];
                    const formattedValue =
                      col.type === "price"
                        ? formatToBRL(colValue as number)
                        : colValue;

                    return (
                      <td className="p-2" key={col.key as string}>
                        {col.key === "total" ? (
                          <span>{formatToBRL(row.total)}</span>
                        ) : (
                          <Input
                            type={col.type === "price" ? "text" : col.type}
                            value={formattedValue}
                            onChange={(e) =>
                              updateRow(i, col.key, e.target.value)
                            }
                          />
                        )}
                      </td>
                    );
                  })}
                  <td className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(i)}
                    >
                      Remover
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button type="button" variant="outline" onClick={addRow}>
          + Adicionar Item
        </Button>

        <p className="text-right font-medium mt-2">
          Total Geral: {formatToBRL(totalGeral)}
        </p>
      </CardContent>
    </Card>
  );
}
