export function ChatShimmer() {
  return (
    <div className="flex h-screen flex-col pb-20">
      {/* Shimmer header */}
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

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* Simulate chat messages with shimmer */}
        <div className="flex justify-start">
          <div className="w-full max-w-md lg:max-w-2xl">
            <div className="w-full animate-pulse rounded-lg bg-gray-200 p-4">
              <div className="mb-3 h-6 w-3/4 rounded bg-gray-300"></div>
              <div className="h-6 w-1/2 rounded bg-gray-300"></div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="w-full max-w-md lg:max-w-2xl">
            <div className="animate-pulse rounded-lg bg-blue-200 p-4">
              <div className="mb-3 h-6 w-2/3 rounded bg-blue-300"></div>
              <div className="h-6 w-1/3 rounded bg-blue-300"></div>
            </div>
          </div>
        </div>

        <div className="flex justify-start">
          <div className="w-full max-w-md lg:max-w-2xl">
            <div className="animate-pulse rounded-lg bg-gray-200 p-4">
              <div className="mb-3 h-6 w-full rounded bg-gray-300"></div>
              <div className="mb-3 h-6 w-3/4 rounded bg-gray-300"></div>
              <div className="h-6 w-1/2 rounded bg-gray-300"></div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="w-full max-w-md lg:max-w-2xl">
            <div className="animate-pulse rounded-lg bg-blue-200 p-4">
              <div className="h-6 w-4/5 rounded bg-blue-300"></div>
            </div>
          </div>
        </div>

        {/* Simulate typing indicator */}
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
      </div>

      {/* Simulate input area */}
      <div className="bg-transparent p-4">
        <div className="flex animate-pulse items-center space-x-3 rounded-lg border border-gray-200 bg-white p-4">
          <div className="h-6 flex-1 rounded bg-gray-200"></div>
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}
