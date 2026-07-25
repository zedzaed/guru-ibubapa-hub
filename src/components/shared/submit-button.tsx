"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type SubmitButtonProps = Omit<ComponentProps<typeof Button>, "type"> & {
  pendingLabel?: string;
};

export function SubmitButton({
  children,
  pendingLabel = "Memproses…",
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <Button
      {...props}
      type="submit"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
