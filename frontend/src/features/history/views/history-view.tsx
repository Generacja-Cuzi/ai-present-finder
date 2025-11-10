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
          <p className="text-gray-500">Ładowanie historii rozmów...</p>
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
              Błąd podczas ładowania rozmów
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Spróbuj ponownie później
            </p>
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
              Brak historii wyszukiwań
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Rozpocznij nową rozmowę, aby znaleźć idealny prezent
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
                giftCount={chat.giftCount}
                isInterviewCompleted={chat.isInterviewCompleted}
                reasoningSummary={chat.reasoningSummary}
              />
            ))}
          </div>
        )}
      </main>

      <Navbar />
    </div>
  );
}
