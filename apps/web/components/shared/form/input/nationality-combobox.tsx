"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ValidNationality } from "@repo/core";
import { useMemo, useState, useCallback } from "react";
import { useDebounce } from "@/hooks";

interface NationalityComboboxProps {
  options: { value: ValidNationality; label: string }[];
  value?: ValidNationality;
  onValueChange: (value: ValidNationality) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

export function NationalityCombobox({
  options,
  value,
  onValueChange,
  placeholder = "Select nationality...",
  searchPlaceholder = "Search nationality...",
  className,
}: NationalityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const debouncedSearchValue = useDebounce(searchValue, 300);

  const filteredOptions = useMemo(() => {
    const trimmedSearch = debouncedSearchValue.trim();
    if (!trimmedSearch) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(trimmedSearch.toLowerCase())
    );
  }, [options, debouncedSearchValue]);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = useCallback(
    (selectedValue: ValidNationality) => {
      onValueChange(selectedValue);
      setOpen(false);
      setSearchValue("");
    },
    [onValueChange]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value);
    },
    []
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <div className="p-2">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={handleSearchChange}
            className="h-9"
          />
        </div>
        <div className="max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground min-w-0">
              No nationality found.
            </div>
          ) : (
            <div className="p-1">
              {filteredOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                    value === option.value && "bg-accent text-accent-foreground"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4 shrink-0",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
