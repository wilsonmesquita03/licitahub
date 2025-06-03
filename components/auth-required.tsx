"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, Children, isValidElement, cloneElement } from "react";
import { authClient } from "@/lib/auth-client";

interface LoginRequiredModalProps {
  children: React.ReactNode;
}

export const LoginRequiredModal = ({ children }: LoginRequiredModalProps) => {
  const { data } = authClient.useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogin = () => {
    const currentPath = window.location.pathname;
    router.push(`/login?from=${encodeURIComponent(currentPath)}`);
    setIsOpen(false);
  };

  if (data?.user) {
    return <>{children}</>;
  }

  let trigger: React.ReactNode;

  if (Children.count(children) === 1 && isValidElement(children)) {
    // @ts-expect-error
    const element = children as ReactElement<any>;

    trigger = cloneElement(element, {
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
      },
    });
  } else {
    trigger = (
      <span
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Autenticação Necessária</DialogTitle>
          <DialogDescription>
            Você precisa estar logado para realizar esta ação.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleLogin}>Fazer Login</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
