import { LabelHTMLAttributes } from "react";

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className="items-center flex justify-between text-sm text-zinc-600"
      {...props}
    />
  );
}
