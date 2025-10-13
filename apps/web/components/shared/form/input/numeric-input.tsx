"use client";

import * as React from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface NumericInputProps
  extends Omit<NumericFormatProps, "customInput" | "onValueChange" | "value"> {
  value?: number;
  onValueChange?: (value: number | undefined) => void;
  className?: string;
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    return (
      <NumericFormat
        {...props}
        customInput={Input}
        className={cn(className)}
        value={value ?? ""}
        onValueChange={(values) => {
          onValueChange?.(values.floatValue);
        }}
        getInputRef={ref}
        thousandSeparator="."
        decimalSeparator=","
      />
    );
  }
);

NumericInput.displayName = "NumericInput";

export { NumericInput };
