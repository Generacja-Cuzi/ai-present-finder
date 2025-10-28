function ShimmerHeader() {
  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-6 w-6 animate-pulse rounded bg-gray-200"></div>
          <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-8 animate-pulse rounded bg-gray-200"></div>
          <div className="h-1 w-24 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}

function ShimmerMessage({
  isUser = false,
  lines = 2,
}: {
  isUser?: boolean;
  lines?: number;
}) {
  const bgColor = isUser ? "bg-blue-200" : "bg-gray-200";
  const lineColor = isUser ? "bg-blue-300" : "bg-gray-300";
  const justifyClass = isUser ? "justify-end" : "justify-start";

  return (
    <div className={`flex ${justifyClass}`}>
      <div className="w-full max-w-md lg:max-w-2xl">
        <div className={`w-full animate-pulse rounded-lg ${bgColor} p-4`}>
          {Array.from({ length: lines }, (_, index) => (
            <div
              key={index}
              className={`mb-3 h-6 rounded ${lineColor} ${
                index === lines - 1 ? "w-1/2" : index === 0 ? "w-3/4" : "w-full"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShimmerTypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="max-w-md lg:max-w-2xl">
        <div className="animate-pulse rounded-lg bg-gray-200 p-4">
          <div className="flex space-x-2">
            <div className="h-3 w-3 animate-bounce rounded-full bg-gray-300"></div>
            <div
              className="h-3 w-3 animate-bounce rounded-full bg-gray-300"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="h-3 w-3 animate-bounce rounded-full bg-gray-300"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShimmerInput() {
  return (
    <div className="bg-transparent p-4">
      <div className="flex animate-pulse items-center space-x-3 rounded-lg border border-gray-200 bg-white p-4">
        <div className="h-6 flex-1 rounded bg-gray-200"></div>
        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
      </div>
    </div>
  );
}

function ShimmerMessages() {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      <ShimmerMessage isUser={false} lines={2} />
      <ShimmerMessage isUser={true} lines={2} />
      <ShimmerMessage isUser={false} lines={3} />
      <ShimmerMessage isUser={true} lines={1} />
      <ShimmerTypingIndicator />
    </div>
  );
}

export function ChatShimmer() {
  return (
    <div className="flex h-screen flex-col pb-20">
      <ShimmerHeader />
      <ShimmerMessages />
      <ShimmerInput />
    </div>
  );
}
