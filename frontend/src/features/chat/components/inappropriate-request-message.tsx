interface InappropriateRequestMessageProps {
  reason: string;
}

export function InappropriateRequestMessage({
  reason,
}: InappropriateRequestMessageProps) {
  return (
    <div className="flex h-[90vh] items-center justify-center">
      <div className="text-center">
        <div className="text-destructive text-xl font-semibold">
          ⚠️ Inappropriate Request Detected
        </div>
        <div className="text-muted-foreground mt-2">{reason}</div>
      </div>
    </div>
  );
}
