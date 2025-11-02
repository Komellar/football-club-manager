"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface TableSearchInputProps {
  placeholder: string;
  searchParamKey?: string;
}

export function TableSearchInput({
  placeholder,
  searchParamKey = "search",
}: TableSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get(searchParamKey) ?? ""
  );
  const debouncedSearch = useDebounce(searchValue);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    const trimmedSearch = debouncedSearch.trim();

    if (trimmedSearch) {
      params.set(searchParamKey, trimmedSearch);
      params.set("page", "1");
    } else {
      params.delete(searchParamKey);
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearch, pathname, router, searchParams, searchParamKey]);

  const handleClear = () => {
    setSearchValue("");
  };

  return (
    <div className="relative flex items-center w-full max-w-3xs">
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="pl-9 pr-9"
      />
      {searchValue && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 h-7 w-7"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
