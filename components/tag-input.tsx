"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "./ui/button";

type TagInputProps = {
  placeholder?: string;
  onChange?: (tags: string[]) => void;
  value?: string[];
};

export default function TagInput({
  placeholder = "Digite e pressione Enter",
  onChange,
  value = [], // valor default para evitar undefined
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (newTag: string) => {
    const trimmed = newTag.trim();
    if (trimmed && !value.includes(trimmed)) {
      const newTags = [...value, trimmed];
      onChange?.(newTags);
    }
  };

  const removeTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index);
    onChange?.(newTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === "Tab" || e.key === ",") && inputValue) {
      e.preventDefault();
      addTag(inputValue);
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && value.length) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-input px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
      {value.map((tag, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="flex items-center gap-1"
        >
          {tag}
          <Button
            onClick={() => removeTag(index)}
            className="hover:text-destructive h-fit"
            variant="ghost"
          >
            <X className="w-2 h-3" />
          </Button>
        </Badge>
      ))}

      <Input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto text-sm w-auto flex-1 min-w-[120px]"
      />
    </div>
  );
}
