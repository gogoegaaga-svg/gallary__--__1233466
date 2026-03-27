import * as React from "react";

import { cn } from "@/lib/utils";

type SecureInputProps = Omit<React.ComponentProps<"input">, "value"> & {
  value: string;
};

const SecureInput = React.forwardRef<HTMLInputElement, SecureInputProps>(
  ({ className, type, value, onChange, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    React.useLayoutEffect(() => {
      const input = innerRef.current;
      if (!input) return;

      if (input.value !== value) {
        const selectionStart = input.selectionStart;
        const selectionEnd = input.selectionEnd;

        input.value = value;

        if (
          document.activeElement === input &&
          selectionStart !== null &&
          selectionEnd !== null
        ) {
          const caretPosition = Math.min(selectionEnd, value.length);
          input.setSelectionRange(caretPosition, caretPosition);
        }
      }

      input.removeAttribute("value");
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      queueMicrotask(() => innerRef.current?.removeAttribute("value"));
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={innerRef}
        onChange={handleChange}
        {...props}
      />
    );
  },
);

SecureInput.displayName = "SecureInput";

export { SecureInput };