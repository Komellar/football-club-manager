import { useFormContext } from "react-hook-form";
import { CreatePlayerDto } from "@repo/core";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/shared/form";

export function TeamInfo() {
  const { control } = useFormContext<CreatePlayerDto>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Team Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField
          control={control}
          name="jerseyNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jersey Number</FormLabel>
              <FormControl>
                <NumericInput
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="e.g. 10"
                />
              </FormControl>
              <FormDescription>Jersey number (1-99)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="marketValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Market Value (€)</FormLabel>
              <FormControl>
                <NumericInput
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="e.g. 1.000.000,00"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="imageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Player Image URL</FormLabel>
            <FormControl>
              <Input
                type="url"
                placeholder="https://example.com/player-photo.jpg"
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
