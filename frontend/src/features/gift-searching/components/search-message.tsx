interface SearchMessageProps {
  message: string;
}

export function SearchMessage({ message }: SearchMessageProps) {
  return <p className="text-muted-foreground">{message}</p>;
}
