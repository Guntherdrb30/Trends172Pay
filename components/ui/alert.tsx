import * as React from "react";
import { cn } from "@/lib/utils";

export function Alert({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-md border border-red-700/70 bg-red-950/40 px-3 py-2 text-sm text-red-100",
        className
      )}
      {...props}
    />
  );
}

