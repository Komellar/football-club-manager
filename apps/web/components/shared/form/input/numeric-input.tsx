"use client";

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
  value?: number | null;
  onValueChange?: (value: number | null) => void;
  className?: string;
}

const NumericInput = ({
  className,
  value,
  onValueChange,
  ...props
}: NumericInputProps) => {
  const { min, max } = props;

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
        onValueChange?.(values.floatValue ?? null);
      }}
      {...props}
      onChange={undefined}
      isAllowed={(values) => {
        const { floatValue } = values;

        if (floatValue !== undefined) {
          return (
            (min == null || floatValue >= Number(min)) &&
            (max == null || floatValue <= Number(max))
          );
        }

        return true;
      }}
    />
  );
};

NumericInput.displayName = "NumericInput";

export { NumericInput };
