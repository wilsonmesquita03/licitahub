import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

type EditInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
};

export const EditInput = ({ icon, className, ...props }: EditInputProps) => {
  return (
    <div className="relative">
      <Input
        {...props}
        className={cn("pr-10", className)} // espaço à direita para o ícone
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-muted-foreground">
        {icon || <Pencil size={16} />}
      </div>
    </div>
  );
};
