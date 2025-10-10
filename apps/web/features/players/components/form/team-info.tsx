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
import { handleNumericFieldChange } from "@/utils/form";

export function TeamInfo() {
  const { control } = useFormContext<CreatePlayerDto>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Team Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="jerseyNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jersey Number</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g. 10"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    handleNumericFieldChange(e.target.value, field.onChange)
                  }
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
              <FormLabel>Market Value</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g. 1000000"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    handleNumericFieldChange(e.target.value, field.onChange)
                  }
                />
              </FormControl>
              <FormDescription>Market value in your currency</FormDescription>
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
            <FormDescription>Optional: URL to player's photo</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
