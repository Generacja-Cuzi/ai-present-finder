import { SearchBar } from "@/components/search-bar";

export function ProfileSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <SearchBar
      value={value}
      onChange={onChange}
      placeholder="Szukaj po imieniu, relacji lub okazji..."
    />
  );
}
