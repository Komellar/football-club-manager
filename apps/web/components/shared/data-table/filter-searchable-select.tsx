"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemo, useState, useCallback } from "react";
import { useDebounce } from "@/hooks";
import { useTranslations } from "next-intl";

export interface FilterSearchableSelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface FilterSearchableSelectProps<T = string> {
  id: string;
  label: string;
  options: FilterSearchableSelectOption<T>[];
  value?: T;
  onValueChange: (value: T) => void;
  onClear: () => void;
  placeholder: string;
  className?: string;
  disabled?: boolean;
  filterFn?: (
    option: FilterSearchableSelectOption<T>,
    searchValue: string
  ) => boolean;
}

export function FilterSearchableSelect<T = string>({
  id,
  label,
  options,
  value,
  onValueChange,
  onClear,
  placeholder,
  className,
  disabled = false,
  filterFn,
}: FilterSearchableSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const t = useTranslations("Common");

  const debouncedSearchValue = useDebounce(searchValue);

  const defaultFilterFn = useCallback(
    (option: FilterSearchableSelectOption<T>, search: string) => {
      return option.label.toLowerCase().includes(search.toLowerCase());
    },
    []
  );

  const filteredOptions = useMemo(() => {
    const trimmedSearch = debouncedSearchValue.trim();
    if (!trimmedSearch) return options;

    const filter = filterFn || defaultFilterFn;
    return options.filter((option) => filter(option, trimmedSearch));
  }, [options, debouncedSearchValue, filterFn, defaultFilterFn]);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = useCallback(
    (selectedValue: T) => {
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

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onClear();
      setSearchValue("");
    },
    [onClear]
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base font-medium">
        {label}
      </Label>
      <div className="relative group">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn(
                "w-full justify-between font-normal",
                !value && "text-muted-foreground",
                className
              )}
            >
              {selectedOption?.label || placeholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            <div className="p-2">
              <Input
                placeholder={t("search")}
                value={searchValue}
                onChange={handleSearchChange}
                className="h-9"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {t("noOptionsFound")}
                </div>
              ) : (
                <div className="p-1">
                  {filteredOptions.map((option, index) => (
                    <button
                      key={`${option.value}-${index}`}
                      onClick={() => handleSelect(option.value)}
                      disabled={option.disabled}
                      className={cn(
                        "relative flex w-full cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        value === option.value &&
                          "bg-accent text-accent-foreground",
                        option.disabled &&
                          "cursor-not-allowed opacity-50 hover:bg-transparent"
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
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>
        )}
      </div>
    </div>
  );
}
