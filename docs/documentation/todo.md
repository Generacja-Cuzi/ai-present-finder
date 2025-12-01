# TODO – dopieszczenie dokumentacji `docs/documentation/main.tex`

1. **Dodać krótkie mostki między dużymi sekcjami**

- Po `\section{Analiza wymagań i sposób pracy}` dodać 1–2 zdania podsumowania typu:
  „Na podstawie tak zebranych i iteracyjnie doprecyzowywanych wymagań przygotowano poniższą specyfikację produktu programowego.”
- Przed `\section{Specyfikacja wymagań na produkt programowy}` dodać zdanie łączące analizę z SRS:
  „Poniższa specyfikacja formalizuje wymagania zidentyfikowane w trakcie kolejnych iteracji i pracy z backlogiem.”
- Przed `\section{Projekt produktu programowego}` dodać zdanie łączące SRS z architekturą:
  „Zdefiniowane wymagania funkcjonalne i niefunkcjonalne zostały odwzorowane w poniższej architekturze mikroserwisowej.”
- Przed `\section{Model danych i baza danych}` dopisać:
  „Aby wesprzeć zdefiniowane przypadki użycia i architekturę, zaprojektowano model danych odzwierciedlający kluczowe byty domenowe.”
- Przed `\section{Modelowanie behawioralne}` dopisać:
  „Po ustaleniu struktury systemu kluczowe było opisanie jego zachowania w czasie w postaci sekwencji, stanów i procesów biznesowych.”
- Przed `\section{Prototypowanie interfejsu}` dopisać:
  „Na podstawie powyższych modeli zaprojektowano interfejs użytkownika, który prowadzi przez najważniejsze przepływy w możliwie naturalny sposób.”

2. **Rozważyć zmianę kolejności „Implementacja” i „Testy”**

- Obecnie: `Prototypowanie` → `Testy` → `Implementacja` → `Wyniki i analiza badań`.
- Propozycja: `Prototypowanie` → `Implementacja` → `Testy` → `Wyniki i analiza badań`.
- Dzięki temu czytelnik najpierw widzi, _jak to zbudowaliśmy_, potem _jak to przetestowaliśmy_, a na końcu _jakie są efekty_.

3. **Dopisać 2–3 „mikro-historie” / mini–case study**

- W `\section{Analiza wymagań i sposób pracy}` (np. przy MVP) dodać krótką anegdotę typu:
  „W trakcie implementacji MVP okazało się, że standardowe wyszukiwanie produktów generuje dużo szumu (duplikaty, części zamienne), co doprowadziło do powstania modułu rerankingu z XAI.”
- W `\section{Wyniki i analiza badań}` dodać 1–2 zdania z konkretnego scenariusza użytkownika, np.:
  „Przykładowo, w jednej z sesji użytkownik szukał prezentu dla fotografa–amatora, a system zaproponował m.in. analogowy aparat z OLX oraz kurs fotografii, co zostało ocenione na 5/5 gwiazdek.”
- W `\section{Testy}` krótko wspomnieć o jednym konkretnym ryzyku, które testy miały wychwycić (np. awaria jednego z fetch-microservices i wpływ na wyniki).

4. **Ujednolicić ton i czas gramatyczny**

- Przejrzeć sekcje pod kątem mieszania czasu teraźniejszego i przeszłego.
- Ustalić konwencję:
- opis architektury, implementacji i prac projektowych: czas przeszły dokonany („zaprojektowano”, „zaimplementowano”, „przeprowadzono testy”),
- opis zachowania systemu z perspektywy użytkownika: czas teraźniejszy („użytkownik wchodzi na stronę, system analizuje profil, wyświetlane są propozycje”).

5. **Drobne wygładzenie językowe pod płynność**

- Ograniczyć powtórzenia konstrukcji typu „Kluczowym elementem systemu jest…” – w 1–2 miejscach zastąpić innymi wstępami (np. „Sercem modułu rekomendacji jest…”, „Istotnym wyróżnikiem rozwiązania jest…”).
- Podzielić najdłuższe zdania (szczególnie w `Analiza wymagań…` i `Wyniki…`) na 2–3 krótsze, bardziej „reportażowe” i łatwiejsze do czytania.

6. **Dopieścić odwołania do rysunków i listingów**

- Upewnić się, że każdy ważny diagram ma jawne odwołanie w tekście:
- np. „Jak pokazano na Rysunku~\ref{fig:c4-component-restapi}, RestAPI dzieli się na…”.
- Dodać po jednym zdaniu komentarza do każdego listingu kodu:
- przed `lst:reranking`: wytłumaczyć, że ten fragment pokazuje, jak systemowe kryteria są zakodowane w promptach i wymuszają XAI;
- przed `lst:orchestration`: podkreślić, że handler zapewnia, iż chat jest najpierw utrwalony w bazie, a dopiero potem emitowane są zdarzenia;
- przed `lst:tools`: wskazać, że tool calling + Zod zapewniają typowaną, przewidywalną współpracę z LLM.

7. **Sprawdzić spójność nazewnictwa**

- Ujednolicić nazwy serwisów i komponentów w całym tekście:
- `RestAPI Macroservice` vs `RestAPI` vs `restapi-macroservice` – wybrać jedną główną formę i ewentualnie dodać w nawiasie pozostałe przy pierwszym użyciu;
- `Chat Microservice` vs `Chat Service` – zdecydować się na jedną formę;
- `Gift Ideas Microservice` / `gift-ideas-microservice` itp.
- Przy pierwszym pojawieniu się angielskiej nazwy dodać krótkie polskie objaśnienie (jeśli jeszcze go nie ma).

8. **Lekko rozbić „ściany tekstu” w kluczowych miejscach**

- W `\section{Analiza wymagań i sposób pracy}`:
- dodać krótkie wypunktowania wewnątrz opisów iteracji (np. „Najważniejsze ryzyka tej iteracji:” / „Najważniejsze artefakty tej iteracji:”), aby ułatwić skanowanie.
- W `\section{Wyniki i analiza badań}`:
- rozważyć dodanie małej tabelki lub dodatkowego wypunktowania, które zbierze główne metryki (czas, trafność, satysfakcja, stabilność) w jednym miejscu.
