Oto kompletny, techniczny i bardzo szczegółowy raport z przebiegu prac nad projektem **AI Present Finder**. Raport został opracowany na podstawie analizy logów z całego semestru, uwzględniając decyzje architektoniczne, dobór technologii, napotkane problemy oraz ich rozwiązania.

---

# Raport Techniczny i Dokumentacja Projektu: AI Present Finder

## 1. Metryka i Zakres Projektu

- **Nazwa projektu:** AI Present Finder
- **Zespół (Generacja Cuzi):**
  - **Dawid Chudzicki:** Backend Lead, Project Manager (PM), Architektura (ARRP, Sequence), Authentication (Google OAuth), Core Backend Logic.
  - **Szymek Kowaliński:** Backend Refactor, Architektura Mikroserwisów, SSE Implementation, Chat Logic, Bugfixing, Frontend Logic.
  - **Bartosz Gotowski (Rei):** DevOps & Infrastructure (Coolify, Docker), Migracje Bazy Danych, Monitoring (Uptime Kuma), Dokumentacja (LaTeX, C4), CI/CD.
  - **Marcin Dolatowski (Dodi):** External Integrations (Fetchers), Reranking Service, Frontend Refactor & UI, Landing Page, Prezentacje/Aspekt biznesowy.
- **Promotor:** dr inż. Artur Jodłowiec
- **Cel:** Stworzenie systemu rekomendacji prezentów opartego na AI, który łączy analizę profilu użytkownika (z czatu lub social media) z rzeczywistymi ofertami ze sklepów internetowych (OLX, eBay, Amazon, etc.).

---

## 2. Architektura Systemu

System ewoluował z monolitu (początkowe koncepcje) do **rozproszonej architektury mikroserwisowej** opartej na zdarzeniach (Event-Driven Architecture).

### 2.1. Komunikacja i Wzorce

- **Message Broker:** RabbitMQ. Służy do asynchronicznej komunikacji między serwisami.
- **Wzorzec Komunikacji:** Zastosowano autorską implementację **ARRP (Asynchronous Request-Reply Pattern)**.
  - Główny serwis (RestAPI) wysyła żądanie (event) do kolejki i oczekuje na odpowiedź na innej kolejce, korelując wiadomości za pomocą unikalnego ID sesji/korelacji.
- **Interfejs Zewnętrzny:** API Gateway (RestAPI) komunikuje się z Frontendem.
- **Streaming Danych:** Zamiast WebSocketów, wybrano **SSE (Server-Sent Events)** do przesyłania w czasie rzeczywistym informacji o statusie wyszukiwania oraz tokenów generowanych przez LLM (efekt pisania na żywo).

### 2.2. Podział na Mikroserwisy

1. **API Gateway (RestAPI Service):**
   - Centralny punkt wejścia.
   - Obsługa autentykacji (Passport.js, JWT, Google OAuth).
   - Zarządzanie sesją użytkownika i historią czatów.
   - Agregacja wyników z innych serwisów i wypychanie ich na Frontend przez SSE.
2. **Chat Service:**
   - Odpowiada za logikę konwersacyjną.
   - Wykorzystuje LLM (modele: Claude Sonnet, Gemini, GPT-4o) do prowadzenia wywiadu z użytkownikiem.
   - Decyduje, kiedy zebrał wystarczająco dużo informacji, by rozpocząć szukanie.
   - Generuje **słowa kluczowe (keywords)** oraz **zapytania (search queries)** dla serwisów wyszukujących.
3. **Stalking Service (White Intelligence):**
   - Moduł odpowiedzialny za budowanie profilu użytkownika na podstawie danych zewnętrznych.
   - Próby integracji: Facebook, Instagram, TikTok, YouTube.
   - Status: Funkcjonalność ograniczona ze względu na agresywne blokady platform (wymagane logowanie, captche). Zaimplementowano działające rozwiązania dla wybranych platform (np. YouTube API, publiczne dane IG przez zewnętrzne API typu Apify/Bright Data).
4. **Gift / Search Service (Fetcher):**
   - Agregator wyszukiwania. Rozsyła zapytania do konkretnych handlerów sklepów.
   - Działa w oparciu o wzorzec strategii/handlerów dla poszczególnych dostawców (OLX Handler, eBay Handler, etc.).
5. **Reranking Service:**
   - Kluczowy element "inteligencji" systemu.
   - Odbiera surowe listy produktów ze sklepów.
   - Dokonuje deduplikacji.
   - Używa LLM do oceny każdego produktu (skala 1-10) w kontekście profilu użytkownika.
   - Generuje **"Reasoning"** – tekstowe uzasadnienie, dlaczego ten prezent pasuje do danej osoby.

### 2.3. Baza Danych

- **Typ:** PostgreSQL.
- **Podejście:** Database per Service (każdy mikroserwis ma własne tabele/schemat, choć fizycznie mogą być na jednej instancji dla oszczędności zasobów w dev/test).
- **ORM:** TypeORM.
- **Migracje:** Wprowadzone w późniejszej fazie projektu (listopad) w celu utrzymania spójności schematu na produkcji (synchronize: false na prod). Użycie CLI TypeORM do generowania i aplikowania migracji.

---

## 3. Integracje Zewnętrzne (Szczegóły Implementacji)

Zespół poświęcił dużo czasu na walkę z API e-commerce i social media ("Scraping Saga").

### 3.1. E-commerce (Search Providers)

- **OLX:** Najstabilniejsza integracja. Wykorzystano publiczne API/GraphQL OLX, które nie posiadało rygorystycznych zabezpieczeń.
- **eBay:** Oficjalne API. Wymagało rejestracji konta developerskiego, działa stabilnie z limitem (ok. 500-5000 requestów dziennie).
- **Amazon:** Użyto RapidAPI (zewnętrzny wrapper), ponieważ oficjalne API Amazon Product Advertising jest trudne do uzyskania dla małych projektów. Limit: 100 zapytań/miesiąc (wymagało rotacji kluczy API między członkami zespołu).
- **Allegro:** Próby nieudane. Oficjalne API wymaga weryfikacji biznesowej. Scrapery (Playwright, Selenium) były natychmiast blokowane lub wymagały rozwiązywania Captcha.
- **Temu / AliExpress:** Próby scrapowania przy użyciu Bright Data (płatne proxy) oraz wnioskowania o dostęp "researcherski". Ostatecznie częściowo działające rozwiązania oparte na scraperach, ale niestabilne.
- **Google Shopping:** Rozważane, ale odrzucone ze względu na koszty/skomplikowanie.

### 3.2. Social Media (Stalking)

- Zespół napotkał silne bariery w scrapowaniu danych z ekosystemu Meta (FB, IG).
- Rozwiązanie: Wykorzystanie płatnych serwisów typu **Apify** do pobierania danych z publicznych profili (koszt ok. $5 miesięcznie).
- Decyzja projektowa: Stalking jest opcjonalny; główny nacisk położono na wywiad (Chat Interface).

---

## 4. Frontend i UX

Aplikacja kliencka przeszła gruntowny refaktoring w połowie semestru.

- **Technologie:** React, TypeScript, Vite.
- **Biblioteki:** TanStack Query (zarządzanie stanem serwerowym), Shadcn UI + Tailwind CSS (komponenty wizualne), Axios (klient HTTP).
- **Routing:** Początkowo rozbity na osobne widoki (`/chat`, `/recommendations`), co powodowało problemy ze stanem. Po refaktoringu (Marcin & Szymek) wprowadzono jeden główny widok sesji (`/session/{id}`), który dynamicznie renderuje komponenty w zależności od statusu (Chatting -> Searching -> Results).
- **Kluczowe funkcjonalności:**
  - **Progress Bars:** Paski postępu podczas wyszukiwania (fejkowane/szacowane, aby użytkownik widział, że "coś się dzieje", np. "Przeszukiwanie OLX...").
  - **Tury Rekomendacji:** Możliwość powrotu do czatu z wybranymi prezentami i poproszenie o doprecyzowanie (np. "Te buty są super, znajdź mi do nich skarpetki").
  - **Historia:** Przeglądanie poprzednich sesji wyszukiwania.
  - **Feedback:** Modal pozwalający użytkownikowi ocenić trafność rekomendacji (wymóg promotora).

---

## 5. Infrastruktura i DevOps (Bartosz Gotowski)

- **Hosting:** VPS dostarczony przez KN Solvro.
- **Platforma:** **Coolify** – wybrane jako alternatywa dla Heroku/AWS do łatwego zarządzania kontenerami Docker.
- **CI/CD:**
  - GitHub Actions do budowania obrazów Dockerowych i pushowania do rejestru.
  - Webhooki do Coolify triggerujące deployment po merge'u do maina.
  - Automatyczne sprawdzanie typów i lintera (ESLint/Prettier - Solvro Config) przed mergem (blokowanie PR w przypadku błędów).
- **Problemy z architekturą procesora:** Konflikty między maszynami deweloperskimi (Apple Silicon - arm64) a serwerem produkcyjnym/kontenerami (linux/amd64). Wymagało to konfiguracji `platform: linux/amd64` w Docker Compose.
- **Zarządzanie sekretami:** Wykorzystanie GitHub Secrets oraz zmiennych środowiskowych w Coolify. Env'y nie były commitowane do repozytorium (poza przykładami).

---

## 6. Problemy Techniczne i Rozwiązania (Logi Błędów)

1. **Problemy z SSE (Server-Sent Events):**
   - _Objaw:_ Zrywanie połączeń, timeouty po kilku minutach, brak danych na froncie mimo wysłania z backendu.
   - _Przyczyna:_ Proxy (Nginx/Cloudflare) buforujące odpowiedzi lub zamykające bezczynne połączenia. Również problem z `gzip` kompresującym strumień eventów.
   - _Rozwiązanie:_ Wyłączenie kompresji dla SSE, implementacja mechanizmu retry (reconnection) na froncie (TanStack Query / EventSource wrapper), wysyłanie "heartbeat" (pingów).

2. **Problemy z RabbitMQ/Microservices:**
   - _Objaw:_ Serwisy nie odbierały wiadomości, błędy "nieznany klient".
   - _Przyczyna:_ Złe nazewnictwo kolejek/exchange'y (hardcoded strings vs. stałe z biblioteki), błędna konfiguracja Topic Exchange.
   - _Rozwiązanie:_ Stworzenie współdzielonej biblioteki typów i eventów (`@core/events`, `@core/types`) w monorepo, ujednolicenie nazw.

3. **Zdjęcia Produktów (S3 vs Linki):**
   - _Problem:_ Linki do zdjęć z aukcji (np. OLX) wygasają po zakończeniu aukcji. Jodłowiec sugerował pobieranie zdjęć na własny S3 bucket.
   - _Decyzja:_ Zespół zdecydował nie implementować S3. Argumentacja: Jeśli aukcja wygasa, prezent i tak jest bezużyteczny (nie można go kupić). Wygasłe zdjęcia w historii są akceptowalnym długiem technicznym w MVP.

4. **Limity API (Rate Limiting):**
   - _Problem:_ Szybkie wyczerpywanie darmowych limitów na Amazon/eBay podczas testów deweloperskich.
   - _Rozwiązanie:_ Mockowanie odpowiedzi API w środowisku lokalnym, tworzenie wielu kont developerskich, implementacja cache'owania wyników.

---

## 7. Przebieg Projektu (Timeline & Management)

- **Październik:** Intensywny development backendu (Dawid/Szymek). Walka z konfiguracją mikroserwisów. Pierwsze wersje diagramów (C4, UML).
- **Listopad:**
  - Skupienie na integracji Frontend-Backend.
  - **Beta testy:** Uruchomienie wersji produkcyjnej dla grupy około 20 testerów (znajomi).
  - Wdrożenie modułu **Feedbacku** (wymóg promotora do zbierania danych jakościowych).
  - Finalizacja funkcji **Rerankingu** i **Reasoningu** (Marcin).
- **Zarządzanie:**
  - Używanie GitHub Projects (Board) do tasków.
  - Code Review: Wymagane (Approve) przed zmergowaniem Pull Requesta. Blokada bezpośrednich pushy do maina.
  - Spotkania z Jodłowcem: Regularne (wtorki/piątki), raportowanie postępów, zbieranie wymagań (np. nacisk na jakość rekomendacji, a nie ilość).

## 8. Stan Końcowy (Grudzień - przed ZPI Day)

Aplikacja jest w pełni funkcjonalna i dostępna online.

- **User Flow:** Użytkownik loguje się (Google), podaje opis okazji/osoby (lub link do social media), czat dopytuje o szczegóły, system przeszukuje sklepy, AI ocenia i sortuje wyniki, prezentuje listę z uzasadnieniem. Użytkownik może kliknąć "Doprecyzuj", by kontynuować szukanie w oparciu o wybrane produkty (Tury).
- **Dokumentacja:** Kompletna (Raport techniczny w LaTeX, Diagramy C4 zaktualizowane, API Docs wygenerowane ze Swaggera/AsyncAPI).
- **Przygotowanie do ZPI Day:** Stworzono plakat (Poster), Abstrakt (6 stron), oraz przygotowano scenariusz demo.

## 9. Wykorzystane Narzędzia i Biblioteki (Tech Stack Summary)

- **Backend:** NestJS, TypeScript, TypeORM, Passport.js, OpenAI SDK / LangChain (do obsługi LLM).
- **Frontend:** React 18, Vite, TailwindCSS, Shadcn/ui, TanStack Query, Axios, Lucide React (ikony).
- **Baza Danych:** PostgreSQL.
- **Message Queue:** RabbitMQ.
- **DevOps:** Docker, Docker Compose, Coolify, GitHub Actions.
- **Narzędzia:** Postman, Insomnia, DBeaver, PlantUML (diagramy jako kod), GitHub Copilot (wsparcie kodowania).

Oto szczegółowe streszczenie i ekstrakcja informacji z logów czatu, uporządkowane pod kątem tworzenia dokumentacji technicznej i opisu przebiegu projektu ZPI (**AI Present Finder**).

### 1. Metryka Projektu

- **Nazwa projektu:** AI Present Finder.

- **Zespół (Pączusie/Generacja Cuzi):**
  - **Dawid Chudzicki:** Backend Lead, PM, Architektura (C4, Sequence), Auth, Scrapery (część), Integracja.
  - **Szymek Kowaliński:** Backend Refactor, Architektura mikroserwisów, Chat Logic, SSE, Fixes.
  - **Bartosz Gotowski (Rei):** DevOps, Deployment (Coolify), Infrastruktura, Migracje BD, Monitoring, Dokumentacja (Latex).
  - **Marcin Dolatowski (Dodi):** Reranking Service, Fetchers (Integracje sklepów), Frontend (Refactor, Landing Page), Dokumentacja/Prezentacje.
- **Promotor:** dr inż. Artur Jodłowiec.
- **Konsultanci/Inni prowadzący:** Juszczyszyn (architektura), Choroś (aspekt biznesowy/prezentacja), Hnatkowska, Puszko.
- **Data finału (ZPI Day):** 12 grudnia 2025.

### 2. Geneza i Cel Projektu

- **Początek:** Styczeń 2025 – wybór promotora (Jodłowiec) i tematu.

- **Rozważane tematy:** Analiza snu (odrzucone jako oklepane), Asystent dla niewidomych, Tłumacz języka migowego, Recepcjonista.
- **Wybrany temat:** System rekomendacji prezentów wykorzystujący AI oraz Biały Wywiad (OSINT/Stalking) z mediów społecznościowych.
- **Główny cel:** Aplikacja webowa, która na podstawie krótkiego wywiadu (czatu) lub analizy profili społecznościowych użytkownika generuje spersonalizowane propozycje prezentów dostępnych w sklepach internetowych.

### 3. Architektura Systemu (Techniczna)

Projekt ewoluował z "Makroserwisu" do architektury opartej na **Mikroserwisach**.

- **Wzorzec komunikacji:** Event-Driven Architecture (RabbitMQ) oraz ARRP (Asynchronous Request-Reply Pattern).
- **Diagramy:** Stworzono diagramy C4 (Context, Container, Component), Diagram Sekwencji, Diagram Domenowy (wielokrotnie poprawiany przez Marcina), BPMN.
- **Infrastruktura:**
  - **Hosting:** Coolify (vps na solvro), serwery PWr.
  - **Konteneryzacja:** Docker.
  - **Bazy danych:** Podejście "Database per Service" (PostgreSQL).
  - **ORM:** TypeORM (z migracjami wprowadzanymi w późniejszej fazie).
  - **Monitoring:** Uptime Kuma / status page.

### 4. Podział na Mikroserwisy i Komponenty

1. **API Gateway / RestAPI (Main):**
   - Punkt wejścia dla Frontendu.
   - Obsługa SSE (Server-Sent Events) do streamowania odpowiedzi (zamiast WebSocketów).
   - Zarządzanie sesjami użytkowników i historią czatów.
2. **Chat Service:**
   - Odpowiada za "rozmowę" z użytkownikiem (LLM).
   - Generuje pytania doprecyzowujące (wywiad).
   - Generuje słowa kluczowe (keywords) i zapytania (queries) do wyszukiwania produktów.
   - Model: Wykorzystuje API LLM (Claude Sonnet / Gemini / GPT) – testowano różne prompty.
3. **Stalking Service (White Intelligence):**
   - Zadanie: Pobieranie informacji o obdarowywanym z social mediów.
   - Źródła (planowane/testowane): Instagram, Facebook, TikTok, LinkedIn, YouTube, Threads.
   - Implementacja: Wykorzystanie zewnętrznych API (np. Apify) oraz prób własnych scraperów. Ostatecznie funkcjonalność ograniczona przez zabezpieczenia platform (Meta), ale działa na wybranych (np. YouTube, publiczne profile IG).
4. **Gift / Search Service (Fetcher):**
   - Wyszukuje konkretne produkty w sklepach na podstawie fraz z Chat Service.
   - **Zintegrowane źródła (działające lub testowane):**
     - **OLX:** Działa (GraphQL/API).
     - **eBay:** Działa (oficjalne API).
     - **Amazon:** Działa (RapidAPI - limity zapytań).
     - **Allegro:** Problemy z weryfikacją API/blokady scraperów, ostatecznie próby obejścia.
     - **AliExpress / Temu:** Próby integracji przez scrapery (Bright Data) lub API (płatne/limitowane).
     - **Google Products:** Rozważane.
5. **Reranking Service:**
   - Analizuje znalezione produkty.
   - Filtruje duplikaty.
   - Ocenia (score 1-10) i sortuje prezenty pod kątem dopasowania do profilu użytkownika (AI-based reasoning).
   - Dodaje uzasadnienie ("Reasoning") dlaczego dany prezent pasuje.

### 5. Frontend i UX

- **Technologia:** React (Vite), TypeScript.

- **Biblioteki:** TanStack Query, Shadcn UI, Tailwind CSS.
- **Kluczowe widoki:**
  - Landing Page.
  - Chat Interface (wywiad).
  - Recommendations View (lista prezentów z paskami ładowania).
  - History View (przeglądanie poprzednich sesji).
- **Funkcjonalności UX:**
  - Logowanie przez Google (OAuth).
  - Paski postępu podczas wyszukiwania (mockowane/szacowane, bo proces jest asynchroniczny).
  - Responsywność (Mobile/Desktop) – poprawiana w fazie refaktoringu.
  - Możliwość powrotu do czatu z wybranymi prezentami ("Tury rekomendacji").

### 6. Przebieg prac i Wyzwania (Timeline)

- **Wrzesień 2025:**
  - Start prac nad POC (Proof of Concept).
  - Stworzenie diagramów C4 i BPMN.
  - Walka ze scrapowaniem social mediów (trudności z FB/Insta bez logowania). Decyzja o zrzutce na płatne rozwiązania (Apify) w razie potrzeby.
  - Ustalenie stacku technologicznego (NestJS + React).

- **Październik 2025:**
  - Implementacja bazowego flow: Chat -> Keywords -> Search (OLX/eBay) -> Reranking.
  - Problemy z CORS i SSE (zrywanie połączeń, timeouty) – naprawione przez Szymka.
  - Walka z API sklepów (Allegro i Temu blokują scrapery). Marcin integruje eBay i Amazon.
  - Refaktoryzacja backendu (Szymek) i wprowadzenie ARRP (Dawid).
  - Dodanie logowania Google.

- **Listopad 2025:**
  - **Beta testy:** Grupa ok. 20 testerów (znajomi). Zbieranie feedbacku.
  - **Feedback:** Dodanie funkcji oceniania propozycji przez użytkownika (zbieranie danych jakościowych dla Jodłowca).
  - **Refactor Frontendu:** Scalenie widoków w jeden route `/session/{id}` zarządzający stanem (chat vs wyniki).
  - **Nowe funkcje:** "Tury" (możliwość dopytania o inne prezenty na bazie znalezionych), Historia wyszukiwań, Profil użytkownika.
  - **Problemy:** Refresh tokeny (naprawione), błędy w Rerankingu przy dużej liczbie produktów, "znikające" obrazki (problem z wygasającymi linkami do zdjęć z aukcji – decyzja o nieużywaniu S3 dla zdjęć, chyba że to konieczne).
  - **Finalizacja:** Przygotowanie plakatu, abstraktu i prezentacji na ZPI Day.

### 7. Decyzje projektowe i "Smaczki" do dokumentacji

- **Dlaczego nie S3 dla zdjęć?** Decyzja o nietrzymaniu zdjęć produktów na własnym buckecie, ponieważ jeśli aukcja wygasa (np. na OLX), to produkt i tak jest niedostępny, więc archiwizacja zdjęcia jest zbędna. Ryzyko: znikające obrazki w historii.

- **Generowanie kodu:** Duże wykorzystanie AI (GitHub Copilot, ChatGPT, Claude) do generowania boilerplate'u, diagramów (PlantUML), a nawet całych komponentów UI.
- **Testy:** Testy E2E były planowane/wymagane do dokumentacji, ale traktowane po macoszemu.
- **Repozytorium:** Monorepo (backend + frontend + mikroserwisy). Konfiguracja ESLint/Prettier (Solvro config).
- **Dokumentacja API:** Swagger (OpenAPI) + AsyncAPI (dla eventów RabbitMQ).

### 8. Co wyróżnia projekt (wg zespołu)?

- Złożona architektura mikroserwisowa z komunikacją asynchroniczną.

- Realne wykorzystanie wielu zewnętrznych API e-commerce.
- Wykorzystanie "Białego wywiadu" do personalizacji (unikalna cecha na tle konkurencji).
- Mechanizm Rerankingu i Reasoningu (tłumaczenie dlaczego AI wybrało ten prezent).
- Możliwość iteracyjnej pracy z wynikami (doprecyzowanie po otrzymaniu propozycji).

### 9. Podsumowanie dla Jodłowca (Stan końcowy)

- Aplikacja działa na produkcji.

- Mamy integrację z wieloma dostawcami (OLX, eBay, Amazon, etc.).
- Zaimplementowano mechanizmy autentykacji i historii.
- Przeprowadzono testy z użytkownikami.
- Dokumentacja obejmuje architekturę, API i procesy biznesowe.
