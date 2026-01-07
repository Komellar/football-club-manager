import { ChartConfig } from "@/components/ui/chart";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

export const TooltipContent = ({
  name,
  value,
  chartConfig,
  isMonetary = false,
}: {
  name: NameType;
  value: ValueType;
  chartConfig: ChartConfig;
  isMonetary?: boolean;
}) => {
  return (
    <>
      <div
        className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
        style={
          {
            "--color-bg": `var(--color-${name})`,
          } as React.CSSProperties
        }
      />
      <div className="text-muted-foreground flex min-w-[130px] items-center text-xs">
        {chartConfig[name as keyof typeof chartConfig]?.label || name}
        <div className="text-foreground ml-auto font-mono font-medium">
          {value.toLocaleString("es-ES")} {isMonetary ? "€" : ""}
        </div>
      </div>
    </>
  );
};
