import { Navbar } from "@/components/ui/navbar";

import { useGetChatsQuery } from "../api/chats.api";
import { ChatCard } from "../components/chat-card";
import { HistoryHeader } from "../components/history-header";

export function HistoryView() {
  const { data, isLoading, isError } = useGetChatsQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <HistoryHeader />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">Loading your chat history...</p>
        </div>
        <Navbar />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <HistoryHeader />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">
              Error loading chats
            </p>
            <p className="mt-1 text-sm text-gray-500">Please try again later</p>
          </div>
        </div>
        <Navbar />
      </div>
    );
  }

  const chats = data?.chats ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <HistoryHeader />

      <main className="flex-1 pb-20">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-gray-900">
              No search history yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Start a new chat to find the perfect gift
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4">
            {chats.map((chat) => (
              <ChatCard
                key={chat.chatId}
                chatId={chat.chatId}
                chatName={chat.chatName}
                createdAt={new Date(chat.createdAt)}
              />
            ))}
          </div>
        )}
      </main>

      <Navbar />
    </div>
  );
}
