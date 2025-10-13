import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { handleNumericFieldChange } from "@/utils/form";
import { useFormContext } from "react-hook-form";
import { CreatePlayerDto } from "@repo/core";
import { NumericInput } from "@/components/shared/form";

export function PhysicalAttributes() {
  const { control } = useFormContext<CreatePlayerDto>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Physical Attributes</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField
          control={control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height (cm)</FormLabel>
              <FormControl>
                <NumericInput
                  placeholder="e.g. 180"
                  value={field.value}
                  onChange={(e) =>
                    handleNumericFieldChange(e.target.value, field.onChange)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <NumericInput
                  placeholder="e.g. 75"
                  value={field.value}
                  onChange={(e) =>
                    handleNumericFieldChange(e.target.value, field.onChange)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
