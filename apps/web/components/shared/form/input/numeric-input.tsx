"use client";

import * as React from "react";
import {
  NumberFormatValues,
  NumericFormat,
  NumericFormatProps,
} from "react-number-format";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface NumericInputProps
  extends Omit<
    NumericFormatProps,
    "customInput" | "onValueChange" | "value" | "onChange"
  > {
  value?: number;
  onValueChange?: (value: number | undefined) => void;
  className?: string;
}

const NumericInput = ({
  className,
  value,
  onValueChange,
  ...props
}: NumericInputProps) => {
  return (
    <NumericFormat
      decimalScale={2}
      thousandSeparator="."
      decimalSeparator=","
      value={value}
      customInput={Input}
      allowNegative={false}
      fixedDecimalScale={true}
      className={cn(className)}
      onValueChange={(values: NumberFormatValues) => {
        onValueChange?.(Number(values.floatValue));
      }}
      {...props}
      onChange={undefined}
    />
  );
};

NumericInput.displayName = "NumericInput";

export { NumericInput };
