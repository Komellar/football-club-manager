import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { handleNumericFieldChange } from "@/utils/form";
import { useFormContext } from "react-hook-form";
import { CreatePlayerDto } from "@repo/core";

export function PhysicalAttributes() {
  const { control } = useFormContext<CreatePlayerDto>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Physical Attributes</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height (cm)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g. 180"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    handleNumericFieldChange(e.target.value, field.onChange)
                  }
                />
              </FormControl>
              <FormDescription>
                Height in centimeters (120-220 cm)
              </FormDescription>
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
                <Input
                  type="number"
                  placeholder="e.g. 75"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    handleNumericFieldChange(e.target.value, field.onChange)
                  }
                />
              </FormControl>
              <FormDescription>Weight in kilograms (40-150 kg)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
