export function InappropriateRequestMessage({ reason }: { reason: string }) {
  return (
    <div className="flex h-[90vh] items-center justify-center">
      <div className="text-center">
        <div className="text-destructive text-xl font-semibold">
          ⚠️ Wykryto nieodpowiednie żądanie
        </div>
        <div className="text-muted-foreground mt-2">{reason}</div>
      </div>
    </div>
  );
}
