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
        Showing {total} {total === 1 ? "gift" : "gifts"}
      </p>
    );
  }

  return (
    <p className="px-4 py-2 text-sm text-gray-600">
      Showing {filtered} of {total} {total === 1 ? "gift" : "gifts"}
    </p>
  );
}
