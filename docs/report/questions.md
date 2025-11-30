# Pytania do doprecyzowania (proszę o krótkie, konkretne odpowiedzi)

- Identyfikacja i zakres
  - Tytuł PL/EN: czy zostajemy przy “AI Present Finder”, czy macie preferowany podtytuł?

  Zostajemy przy "AI Present Finder".
  - Język raportu: polski (tak wynika z task.md)? Potwierdzacie?

  Tak, raport będzie w języku polskim.
  - Role w zespole: kto za jakie moduły odpowiadał (frontend, każde mikroserwisowe domeny, DevOps, testy, dokumentacja)?

  Bartosz Gotowski - DevOps, Mikroserwisy (Stalking)
  Dawid Chudzicki - Frontend, Mikroserwisy (Fetch)
  Szymon Kowaliński - Mikroserwisy (Chat, Gift Ideas)
  Marcin Dolatowski - Mikroserwisy (Fetch, Reranking), Testy
  - Docelowy zakres MVP vs. zrealizowany: które funkcjonalności z fiszki/projektu są faktycznie wdrożone i działające, a które pozostają w planach?

  To proszę określ na podstawie kodu w repozytorium, w folderach backend i frontend jest cały nasz obecny kod.

  **✅ ZWERYFIKOWANE NA PODSTAWIE KODU:**

  **Backend (9 mikroserwisów w PM2):**
  - `restapi-macroservice` — HTTP entry point, JWT + Google OAuth, SSE fanout
  - `stalking-microservice` — scraping profili (BrightData) + ekstrakcja AI
  - `chat-microservice` — wywiad konwersacyjny z użytkownikiem
  - `gift-ideas-microservice` — generowanie pomysłów na prezenty
  - `fetch-microservice` x4 (olx, allegro, ebay, amazon) — pobieranie produktów
  - `reranking-microservice` — filtrowanie i ranking produktów AI

  **Frontend (React + Vite + TanStack Router):**
  - `/` — strona powitalna
  - `/login` — logowanie (Google OAuth)
  - `/start-search` — inicjacja wyszukiwania (linki social, budżet, okazja)
  - `/chat` — rozmowa z chatbotem AI
  - `/history` — historia poprzednich sesji
  - `/profile` — profil użytkownika
  - `/saved` — zapisane produkty
  - `/admin` — panel administracyjny

  **Zaimplementowane funkcjonalności MVP:**
  1. ✅ Scraping profili social media (Instagram, TikTok, X/Twitter)
  2. ✅ Ekstrakcja słów kluczowych AI (OpenAI gpt-5-nano)
  3. ✅ Wywiad chatbotowy (Google Gemini 2.5-flash)
  4. ✅ Generowanie pomysłów na prezenty (OpenAI GPT-4o)
  5. ✅ Multi-source fetch (OLX, Allegro, eBay, Amazon)
  6. ✅ Reranking AI (Google Gemini 2.5-flash-lite)
  7. ✅ Real-time SSE do frontendu
  8. ✅ Autentykacja Google OAuth + JWT
  9. ✅ Persystencja sesji w PostgreSQL
  10. ✅ Historia i zapisane prezenty

- Użytkownik i scenariusz użycia
  - Główny przypadek użycia do pokazania w raporcie: jaki realny scenariusz (np. “prezent dla studenta informatyki, 22 lata, budżet 200 zł”) wykorzystamy jako case study?

  Tak, ten przykładowy jest dobry.
  - Jakie platformy społecznościowe faktycznie obsługujecie w MVP (konkret: linki do profili/typ danych) i czy korzystacie obecnie z BrightData datasetów w deployu?

  Sprawdź kod na backendzie w stalkingu

  **✅ ZWERYFIKOWANE W `stalking-microservice/src/app/services/brightdata.service.ts`:**

  Obsługiwane platformy w MVP (z pełną implementacją):
  - **Instagram** — profil użytkownika (dataset: `gd_l1vikfch901nx3by4`)
  - **TikTok** — profil użytkownika (dataset: `gd_l1villgoiiidt09ci`)
  - **X/Twitter** — posty użytkownika (dataset: `gd_lwxkxvnf1cynvib9co`)

  Platforma automatycznie wykrywa źródło na podstawie URL i wybiera odpowiedni dataset BrightData. W trybie developerskim można używać mock data (`USE_MOCK_DATA=true`).
  - Ile pytań przeciętnie zadaje chat w rozmowie? Jakie są przykładowe pytania i reguły przejścia (skrót logiki)?

  Zwykle zadaje koło 30 pytań. Przykładowe pytania to: "Jakie są zainteresowania tej osoby?", "Czy preferuje elektronikę czy książki?". Wiecej przeczytasz tutaj: backend/chat-microservice

  **✅ ZWERYFIKOWANE W BAZIE DANYCH (restapi_service):**
  - **Średnia liczba pytań asystenta:** 12 (z 36 sesji)
  - Przykładowa sekwencja pytań (z realnej sesji):
    1. "Dla kogo szukasz prezentu z okazji święta?"
    2. "Kim dokładnie jest ta osoba z rodziny?"
    3. "W jakim przedziale wiekowym jest?"
    4. "Co robi w wolnym czasie?"
    5. "Czy ma dobry sprzęt komputerowy do pracy lub rozrywki?"
    6. "Czy słucha muzyki lub interesuje się sprzętem audio?"
    7. "Czy podróżuje lub planuje jakieś wyjazdy?"
    8. ... (kontynuacja doprecyzowująca zainteresowania)

  Chat używa tool-based flow z Gemini 2.5-flash — model decyduje kiedy zadać pytanie, a kiedy zakończyć wywiad.

- Architektura i stan wdrożenia
  - Aktualny stan usług: które mikroserwisy są w pełni działające w prod/dev (REST, Stalking, Chat, Gift Ideas, Fetch x4, Reranking)?

  Wszystko obecnie działa na prodzie pod adresem <https://aipf.o.suzuya.dev>
  - Czy produkcyjne wdrożenie na Coolify już stoi pod domenami (API/Frontend)? Jeśli tak — podajcie URL-e.

  frontend: <https://aipf.o.suzuya.dev>
  api: <https://api.aipf.o.suzuya.dev>
  - Czy SSE real-time działa stabilnie w deployu? Macie znane ograniczenia (np. time-outy reverse proxy)?

  Działa bardzo stabilnie, naprawiliśmy sporo błędów z tym związanych, możesz przejrzeć commity
  - Czy bazy Postgres (5 DB) mają wdrożone migracje; jakie schematy tabel faktycznie istnieją i są używane w MVP?

  Tak, są wdrożone automatyczne migracje, spójrz na github actions u nas w projekcie.

- Modele AI i jakość
  - Jakie konkretne modele są używane w każdym flow (stalking extraction, chat, gift ideas, reranking)? W repo są wzmianki o OpenAI i Gemini (Vercel AI SDK) — proszę o finalne potwierdzenie modeli i wersji.

  Sprawdź w konkretnych mikroserwisach.

  **✅ ZWERYFIKOWANE W KODZIE (pliki `src/app/ai/flow.ts`):**

  | Mikroserwis             | Model                   | Provider | Zastosowanie                                |
  | ----------------------- | ----------------------- | -------- | ------------------------------------------- |
  | stalking-microservice   | `gpt-5-nano`            | OpenAI   | Ekstrakcja słów kluczowych z profili social |
  | chat-microservice       | `gemini-2.5-flash`      | Google   | Wywiad konwersacyjny (tool-based)           |
  | gift-ideas-microservice | `gpt-4o`                | OpenAI   | Generowanie pomysłów na prezenty            |
  | reranking-microservice  | `gemini-2.5-flash-lite` | Google   | Scoring i ranking produktów                 |

  Wszystkie flow korzystają z Vercel AI SDK (`ai` package) z `generateObject()` lub `generateText()` i schematami Zod.
  - Jak mierzyliście jakość rekomendacji? Czy macie:
    - metryki (np. średni czas od startu do rekomendacji, TOP-k trafność wg oceny użytkownika),

    Nie mamy na razie metryk, ale wyszukanie prezentu zajmuje koło 3 minut. Użtkownicy w 80% są zadowoleni z rekomendacji i w 64% pierwszy wynik jest dla nich zadowalający.
    - feedback użytkowników/testerów - dałem do pliku feedback.md
    - porównanie “z/bez rerankingu” albo “tylko chat vs. chat+stalking”? reranking jest zawsze, bez niego prezenty były bardzo losowe

  - Czy macie przykładowe transkrypcje rozmów i wynikowe listy prezentów, które możemy zanonimizować i wstawić do raportu?

  Połącz się do bazy danych przez SSH i wyciągnij co potrzebujesz.

  **✅ ZEBRANE — PATRZ `data-collection.md`:**

  Zebrano z produkcyjnej bazy danych (30.11.2025):
  - Przykładowa transkrypcja wywiadu (14 pytań, ~2 min)
  - Top 10 rekomendowanych produktów (głośniki Bluetooth)
  - Przykłady ocen rerankingu z uzasadnieniami AI

- Integracje e-commerce i wyniki wyszukiwań
  - Jakie źródła produktowe działają realnie teraz: OLX, Allegro, Amazon, eBay? W jakim trybie (sandbox/produkcyjny)?

  sprawdź w kodzie

  **✅ ZWERYFIKOWANE W `fetch-microservice/src/app/handlers/`:**

  | Provider | Handler                    | Tryb                      | Uwagi                          |
  | -------- | -------------------------- | ------------------------- | ------------------------------ |
  | OLX      | `fetch-olx.handler.ts`     | Produkcyjny (GraphQL API) | Główne źródło (~99% produktów) |
  | Allegro  | `fetch-allegro.handler.ts` | Produkcyjny (REST API)    | ~1% produktów                  |
  | eBay     | `fetch-ebay.handler.ts`    | Produkcyjny               | Aktywny, mniej wyników PL      |
  | Amazon   | `fetch-amazon.handler.ts`  | Produkcyjny               | Aktywny, mniej wyników PL      |

  Każdy provider działa jako osobna instancja PM2 (fetch-microservice-olx, fetch-microservice-allegro, itd.).
  - Średnia liczba zwracanych ofert na jedną propozycję prezentu i średni czas pobrania produktów?

  sprawdź w bazie danych

  **✅ ZWERYFIKOWANE W BAZIE DANYCH:**

  | Metryka                                                | Wartość              | Źródło                     |
  | ------------------------------------------------------ | -------------------- | -------------------------- |
  | Średnia liczba listingów na chat                       | **70**               | restapi_service.listings   |
  | Średnia liczba produktów na sesję (przed rerankingiem) | **116**              | reranking_service.products |
  | Średni czas do pierwszych wyników                      | **464 s (~7.7 min)** | restapi_service.listings   |
  | Łączna liczba pobranych produktów                      | 2316                 | reranking_service.products |
  - Czy reranking faktycznie poprawia trafność (subiektywnie/metrycznie)? Jeśli tak, proszę o choć jedną krótką obserwację/miarę.

  tak, reranking jest potrzebny bo zwracaliśmy ponad 100 prezentów i często te najlepsze były w środku listy

- Bezpieczeństwo, prywatność, zgodność
  - Ostateczna polityka danych: czy rzeczywiście “brak trwałego przechowywania po sesji”, czy w MVP już utrwalacie historię czatu/sesji (w fiszce jest plan persystencji)?

  nie, teraz przechowujemy rzeczy w bazce, sprawdź baze danych
  - Czy przetwarzacie wyłącznie dane publiczne i macie widoczne w UI disclaimery/zgody?

  tak, przetwarzamy tylko dane publiczne - sprawdź frontend
  - Czy rozpatrywaliście zgodność z RODO (rolę administratora danych, podstawę prawną, retencję)? Jeśli tak — proszę o jednozdaniowe stanowisko do rozdziału “etyka i prywatność”.

  nie rozpatrywaliśmy, możesz sam coś wymyśleć

- Porównanie z konkurencją
  - Macie aktualne spostrzeżenia z testów konkurencyjnych narzędzi (DreamGift, GiftAssistant, Giftruly, IntelliGift)? Jakie 2–3 przewagi chcecie podkreślić (np. social scraping + multi-source fetch + reranking + SSE)?

  social scraping, bazowanie na AI, podawanie konretnych linków do ofert,
  - Czy chcecie umieścić tabelę porównawczą (z liczbą pytań, źródłami danych, integracjami, liczbą propozycji)?

  tak

- Wyniki i demo w raporcie
  - Jakie konkretne liczby/wykresy możemy pokazać: czas od startu do wyników, liczba eventów RMQ na sesję, liczba produktów/źródeł, zużycie pamięci/CPU (PM2), koszty miesięczne?

  wszystko to jest spoko, bazuj na informacjach z bazy danych
  - Czy macie zrzuty ekranu frontendu (welcome / chat / finding / results) — w designs są szkice tekstowe; czy mamy aktualne screeny, które możemy dodać do raportu?

  tak, wrzuce jest do folderu "screenshts"
  - Jedno najważniejsze osiągnięcie projektu (headline wyników), które powinniśmy wyróżnić w abstrakcie i w wnioskach?

  3 minuty do znalezienia na 90% trafionego prezentu

- Diagramy i dokumentacja techniczna
  - Czy C4 v0.2.0 i sekwencje w `docs/sequence_diagram/*` odzwierciedlają stan MVP? Jeśli coś odbiegło, wskażcie gdzie, żebym zaktualizował opis.

  sam sprawdź to w backendzie

  **✅ ZWERYFIKOWANE — DIAGRAM C4 v0.2.0 JEST AKTUALNY:**

  Diagram `docs/C4_v0.2.0/container.puml` poprawnie odzwierciedla:
  - 7 kontenerów (frontend, rest_api, stalking_svc, chat_svc, gift_svc, fetch_svc, reranking_svc)
  - RabbitMQ jako message broker
  - Zewnętrzne systemy: Google OAuth, OpenAI, Google Gemini, BrightData
  - Platformy social: Instagram, TikTok, X
  - Platformy e-commerce: Allegro, Amazon, eBay, OLX
  - Flow eventów (StalkingAnalyzeRequestedEvent, ChatStartInterviewEvent, etc.)

  Dostępne diagramy w SVG: `C4_Container.svg`, `C4_Context_MVP.svg`, `C4_Component_*.svg` dla każdego mikroserwisu.
  - ERD dla REST API w databases — czy w raporcie chcemy pokazać wycinek najistotniejszych tabel (np. sesje rozmów, listingi), czy zostawić ERD w dodatkach?

  tak, chcemy to w raporcie
  - Chcecie dołączyć BPMN głównego przepływu użytkownika (jest w diagram.bpmn)?

  nie dołączaj, możesz go opisać

- Testy, jakość, ryzyka
  - Zakres testów: co faktycznie macie pokryte (unit/integration), najważniejsze testy krytycznych ścieżek?

  sprawdź w kodzie

  **✅ ZWERYFIKOWANE (10 plików `*.spec.ts`):**

  | Mikroserwis             | Pliki testowe                                                                                                              | Typ                  |
  | ----------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------- |
  | fetch-microservice      | `fetch-olx.handler.spec.ts`, `fetch-allegro.handler.spec.ts`, `fetch-ebay.handler.spec.ts`, `fetch-amazon.handler.spec.ts` | Unit (mockowane API) |
  | stalking-microservice   | `brightdata.service.spec.ts`, `stalking-analyze.handler.spec.ts`                                                           | Unit + Integration   |
  | restapi-macroservice    | `resource-ownership.guard.spec.ts`, `health.controller.spec.ts`                                                            | Unit                 |
  | chat-microservice       | `app.controller.spec.ts`                                                                                                   | Unit                 |
  | gift-ideas-microservice | `app.controller.spec.ts`                                                                                                   | Unit                 |

  Testy używają Jest + NestJS Testing. Mockowane są zewnętrzne API (BrightData, e-commerce).
  - Największe ryzyko, które “naprawdę się zmaterializowało” i jak je mitigowaliście (np. ograniczenia API social / e-commerce, limity modeli, latencja)?

  ograniczenia ecommerce, dlatego mamy ich aż tyle, żeby sie balansowało
  - Najważniejsza lekcja techniczna i organizacyjna, którą warto ująć w “Wnioskach”.

- DevOps i koszty
  - Parametry docelowego serwera i obserwowane zużycie w PM2 (CPU/RAM), realne koszty miesięczne w obecnym profilu użycia?

  serwer to 4vCPU, 8GB RAM, koszty miesięczne to ok 20-25 USD
  - Czy mamy skonfigurowane backupy Postgresa w prod, monitoring w Coolify i podstawowe alerty?

  tak, mamy alerty na uptime kuma, backupy w coolify i monitoring

- Bibliografia i załączniki
  - Macie listę źródeł do bibliografii (dokumentacje, artykuły, narzędzia). Czy mamy korzystać z istniejącego `references.bib`, czy przygotować nowy zestaw pozycji?

  przygotuj sam propozycje, nie patrz na references
  - Czy chcecie dodać krótkie “Podziękowania” (np. dla opiekuna, konsultantów, społeczności)?

  nie chcemy

- Organizacyjne
  - Termin i wymagania formalne: potwierdźcie wymóg 6 stron i LaTeX + szablon z report.

  tak
  - Czy przewidujecie wersję PL tylko, czy również EN (streszczenie/abstract po angielsku)?

  tylko PL

Co dalej po Waszych odpowiedziach

- Ułożę spójną, “nagłówkową” narrację (problem → podejście → wynik), akcentując unikalność: połączenie social-data extraction + konwersacyjnego wywiadu + multi-source fetch + reranking + live SSE.
- Przygotuję szczegółowy spis treści raportu pod 6 stron A4 w LaTeX, z miejscem na wykresy/case study i porównanie konkurencji.
- Zaproponuję, które diagramy i screeny włączyć do głównej części, a co dołączyć jako dodatki.

Dajcie proszę odpowiedzi punktami — to przyspieszy zamknięcie idealnego szkicu struktury.
