import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export function Button({ children, className = "", ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={`rounded-2xl px-4 py-3 font-semibold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
