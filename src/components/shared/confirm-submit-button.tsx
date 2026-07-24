"use client";

import { Button, type ButtonProps } from "@/components/ui/button";

interface ConfirmSubmitButtonProps extends ButtonProps {
  message: string;
}

export function ConfirmSubmitButton({ message, onClick, ...props }: ConfirmSubmitButtonProps) {
  return (
    <Button
      {...props}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    />
  );
}
