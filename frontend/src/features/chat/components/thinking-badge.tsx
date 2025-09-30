export function ThinkingBadge() {
  return (
    <div className="flex animate-pulse items-center space-x-2 rounded-lg bg-gray-50 p-3">
      <div className="flex space-x-1">
        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
      <span className="text-sm text-gray-500">Thinking...</span>
    </div>
  );
}
