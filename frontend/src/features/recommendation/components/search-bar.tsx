import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        placeholder="Search for presents..."
        value={value}
        onChange={(event_) => {
          onChange(event_.target.value);
        }}
        className="h-12 rounded-full border-gray-200 bg-gray-50 pl-11 pr-4 text-base"
      />
    </div>
  );
}
