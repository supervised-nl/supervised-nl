"use client";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

export function ConfirmButton({
  confirmMessage,
  onClick,
  ...props
}: ComponentProps<typeof Button> & { confirmMessage: string }) {
  return (
    <Button
      {...props}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    />
  );
}
