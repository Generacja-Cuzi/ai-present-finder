export function ResultsCount({
  total,
  filtered,
}: {
  total: number;
  filtered: number;
}) {
  if (total === filtered) {
    return (
      <p className="px-4 py-2 text-sm text-gray-600">
        Wyświetlanie {total}{" "}
        {total === 1 ? "prezentu" : total < 5 ? "prezentów" : "prezentów"}
      </p>
    );
  }

  return (
    <p className="px-4 py-2 text-sm text-gray-600">
      Wyświetlanie {filtered} z {total}{" "}
      {total === 1 ? "prezentu" : total < 5 ? "prezentów" : "prezentów"}
    </p>
  );
}
