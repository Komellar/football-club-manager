"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface FilterSelectProps {
  id: string;
  label: string;
  value: string | undefined;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  onValueChange: (value: string) => void;
  onClear: () => void;
}

export function FilterSelect({
  id,
  label,
  value,
  placeholder,
  options,
  onValueChange,
  onClear,
}: FilterSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base font-medium">
        {label}
      </Label>
      <div className="relative group">
        <Select value={value || ""} onValueChange={onValueChange}>
          <SelectTrigger id={id}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onClear();
            }}
            className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>
        )}
      </div>
    </div>
  );
}
