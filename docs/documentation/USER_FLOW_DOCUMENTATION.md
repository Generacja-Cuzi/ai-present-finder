# AI Present Finder - Dokumentacja Flow Użytkownika

## Spis treści

1. [Przegląd architektury frontendu](#przegląd-architektury-frontendu)
2. [Struktura routingu](#struktura-routingu)
3. [Szczegółowy opis ekranów](#szczegółowy-opis-ekranów)
4. [Nawigacja główna](#nawigacja-główna)
5. [Diagramy flow użytkownika](#diagramy-flow-użytkownika)

---

## Przegląd architektury frontendu

Aplikacja wykorzystuje:

- **React** z TypeScript
- **TanStack Router** - typowane routowanie
- **TanStack Query** - zarządzanie stanem serwerowym
- **Shadcn/UI** - komponenty UI
- **Tailwind CSS** - stylowanie
- **SSE (Server-Sent Events)** - komunikacja w czasie rzeczywistym z backendem

---

## Struktura routingu

```
/                           → Landing Page (publiczny)
/login                      → Strona logowania (publiczny)
/_authenticated/            → Layout chroniący zalogowane ścieżki
  ├── /start-search         → Formularz nowego wyszukiwania
  ├── /chat/$id             → Widok czatu / wyszukiwania / rekomendacji
  ├── /saved                → Zapisane prezenty (ulubione)
  ├── /history              → Historia sesji wyszukiwania
  ├── /profile              → Profil użytkownika
  └── /admin/feedbacks      → Panel administracyjny (tylko admini)
```

---

## Szczegółowy opis ekranów

### 1. Landing Page (`/`)

**Plik**: `frontend/src/features/landing/views/landing-view.tsx`

**Komponenty**:

- **Hero** - główny baner z logo i CTA "Rozpocznij"
- **HowItWorks** - 4 karty opisujące proces:
  1. Udostępnij linki społecznościowe
  2. Porozmawiaj z AI
  3. Wyszukiwanie napędzane AI
  4. Filtruj i wybieraj
- **Team** - sekcja zespołu
- **FAQ** - często zadawane pytania (5 pytań)
- **ScrollToTop** - przycisk powrotu na górę

**Akcje użytkownika**:

- Kliknięcie "Rozpocznij" → przekierowanie do `/start-search`

---

### 2. Strona logowania (`/login`)

**Plik**: `frontend/src/routes/login.tsx`

**Elementy**:

- Nagłówek "Zaloguj się"
- Przycisk "Zaloguj się przez Google"

**Flow**:

1. Użytkownik klika przycisk
2. Uruchamiana jest funkcja `login()` z kontekstu autoryzacji
3. Po pomyślnym logowaniu → przekierowanie do `/`

---

### 3. Formularz wyszukiwania (`/start-search`)

**Plik**: `frontend/src/features/stalking/views/stalking-view.tsx`

**Wymaga autoryzacji**: ✅

**Sekcje formularza**:

#### a) Pytanie o profil (opcjonalne)

Wyświetlane tylko jeśli użytkownik ma zapisane profile osób z poprzednich sesji:

- "Czy chcesz wczytać profil osoby?"
- Przyciski: "Tak, wczytaj profil" / "Nie, pomiń"
- Dialog wyboru profilu

#### b) Social Links Section

- Nagłówek: "Opowiedz nam o tej osobie"
- 3 pola input:
  - Instagram URL (`instagram.com/username`)
  - X (Twitter) URL (`x.com/username`)
  - TikTok URL (`tiktok.com/@username`)

#### c) Occasion Selector

- Nagłówek: "Jaka jest okazja?"
- 4 przyciski do wyboru (siatka 2x2):
  - 🎂 Urodziny (`birthday`)
  - ❤️ Rocznica (`anniversary`)
  - 🔥 Święta (`holiday`)
  - 😊 Tak po prostu (`just-because`)

#### d) Budget Section

- Nagłówek: "Jaki jest Twój budżet?"
- 4 opcje (siatka 2x2):
  - Do 50zł
  - 50-100zł
  - 100-200zł
  - Inny (pokazuje pola min/max)

#### e) Submit Bar

- Przycisk "Rozpocznij wyszukiwanie"
- Walidacja: wymaga okazji i poprawnych URL-i

**Flow po wysłaniu**:

1. Generowany jest unikalny `clientId` (UUID v7)
2. Wysyłane jest żądanie do API
3. Przekierowanie do `/chat/{clientId}`

---

### 4. Widok czatu (`/chat/$id`)

**Plik**: `frontend/src/features/chat/views/chat-view.tsx`

**Wymaga autoryzacji**: ✅

**Parametry URL**:

- `id` - identyfikator sesji czatu
- `?from=history` - opcjonalny parametr określający skąd przyszedł użytkownik

**Stany widoku** (zarządzane przez SSE):

#### a) ChatShimmer (ładowanie)

Wyświetlany podczas ładowania stanu początkowego.

#### b) ChatUI (wywiad)

**Plik**: `frontend/src/features/chat/components/chat-ui.tsx`

**Elementy**:

- **ChatHeader** - pasek postępu (current step / 30 total steps)
- **ChatMessages** - lista wiadomości:
  - Wiadomości asystenta (strona lewa)
  - Wiadomości użytkownika (strona prawa)
  - Wskaźnik pisania podczas przetwarzania
- **PotentialAnswers** - sugerowane odpowiedzi (przyciski)
- **ChatInput** - pole tekstowe do własnej odpowiedzi

**Flow wywiadu**:

1. AI zadaje pytanie
2. Wyświetlane są sugerowane odpowiedzi
3. Użytkownik wybiera odpowiedź lub wpisuje własną
4. AI odpowiada i zadaje kolejne pytanie
5. Po ~8-12 pytaniach wywiad kończy się

**Specjalny przypadek**: `InappropriateRequestMessage`

- Wyświetlany gdy użytkownik próbuje użyć systemu do niestosownych celów

#### c) SearchingView (wyszukiwanie)

**Plik**: `frontend/src/features/chat/views/searching-view.tsx`

**Elementy**:

- Animowana ikona prezentu
- Pasek postępu (0-100%, max 60 sekund)
- Komunikat: "Analizujemy głęboko ich zainteresowania..."

**SSE**: Połączenie utrzymywane w tle do otrzymania zdarzenia zakończenia.

#### d) SearchRecommendationView (rekomendacje)

**Plik**: `frontend/src/features/chat/views/search-recommendation.tsx`

Wrapper przekierowujący do `RecommendationView`.

---

### 5. Widok rekomendacji

**Plik**: `frontend/src/features/recommendation/views/recommendation-view.tsx`

**Elementy interfejsu**:

#### a) Header

- Przycisk powrotu (do `/start-search` lub `/history`)
- Tytuł

#### b) Tryby interakcji

Górna belka z przyciskami:

- **Tryb normalny**:
  - "Wybierz prezenty" → włącza tryb selekcji
  - "Oceń wyniki" → włącza tryb oceniania
- **Tryb selekcji**:
  - Przycisk "Anuluj"
  - Licznik wybranych
  - "Doprecyzuj (X)" → otwiera dialog refinementu
- **Tryb oceniania**:
  - Przycisk "Anuluj"
  - "Ogólna opinia" → feedback dla całej sesji

#### c) Filtry

- **SearchBar** - wyszukiwarka tekstowa
- **FilterButton: Sklepy** - dialog wielokrotnego wyboru (OLX, Allegro, Amazon, eBay)
- **FilterButton: Zakres cen** - suwak min/max
- **FilterButton: Kategoria** - dialog wielokrotnego wyboru
- **FilterButton: Tury** - filtrowanie po rundzie refinementu
- **ClearFiltersButton** - reset filtrów

#### d) Licznik wyników

- "Wyświetlono X z Y prezentów"

#### e) Siatka produktów

Karty produktów (`GiftCard`) w siatce responsywnej:

- 2 kolumny (mobile) → 6 kolumn (desktop)

**Karta produktu zawiera**:

- Badge z nazwą sklepu (OLX, Allegro, Amazon, eBay)
- Przycisk zakładki (dodaj do ulubionych)
- Zdjęcie produktu (lub placeholder)
- Cena z walutą
- Tytuł (max 2 linie)
- Przycisk "Kup teraz" (link zewnętrzny)

#### f) Dialogi

**ShopsFilterDialog** - wybór sklepów
**PriceRangeFilterDialog** - zakres cenowy
**CategoryFilterDialog** - kategorie produktów
**RoundsFilterDialog** - tury wyszukiwania
**FeedbackDialog** - formularz opinii:

- Ocena gwiazdkowa (1-5) _wymagane_
- Komentarz tekstowy (opcjonalnie, max 100/300 słów)
- Zdjęcia (tylko dla ogólnej opinii, max 5)

**RefineSearchDialog** - potwierdzenie doprecyzowania:

- Liczba wybranych produktów
- Przycisk "Doprecyzuj" → nowa runda wyszukiwania

---

### 6. Zapisane prezenty (`/saved`)

**Plik**: `frontend/src/features/saved/views/saved-view.tsx`

**Wymaga autoryzacji**: ✅

**Elementy**:

- **SavedHeader** - nagłówek "Zapisane"
- **GiftCard grid** - siatka zapisanych produktów
- **Empty state** - komunikat gdy brak zapisanych

**Różnice od RecommendationView**:

- Brak filtrów
- Provider zawsze "Zapisane"
- Wszystkie produkty mają `initialIsFavorited={true}`

---

### 7. Historia sesji (`/history`)

**Plik**: `frontend/src/features/history/views/history-view.tsx`

**Wymaga autoryzacji**: ✅

**Elementy**:

- **HistoryHeader** - nagłówek "Historia"
- **Lista ChatCard** - karty sesji

**ChatCard zawiera**:

- Nazwa sesji (chatName)
- Data utworzenia
- Liczba znalezionych prezentów
- Przycisk "Zobacz tok myślowy" (jeśli dostępne `reasoningSummary`)
- Przycisk akcji:
  - "Pokaż wyniki" (jeśli `isInterviewCompleted`)
  - "Kontynuuj rozmowę" (jeśli wywiad nieukończony)

**ReasoningDialog** - pokazuje:

- Profil odbiorcy
- Kluczowe tematy i słowa kluczowe

---

### 8. Profil użytkownika (`/profile`)

**Plik**: `frontend/src/features/profile/views/profile-view.tsx`

**Wymaga autoryzacji**: ✅

**Komponenty**:

- **ProfileHeader** - nagłówek "Profil"
- **ProfileAvatar** - zdjęcie użytkownika
- **ProfileInfo** - imię, nazwisko, email, badge admina
- **ProfileSettings** - ustawienia konta
- **ProfileActions**:
  - "Zobacz feedbacki" (tylko admin) → `/admin/feedbacks`
  - "Wyloguj się" → logout i przekierowanie do `/`

---

### 9. Panel administracyjny (`/admin/feedbacks`)

**Plik**: `frontend/src/features/admin/views/feedbacks-view.tsx`

**Wymaga autoryzacji**: ✅
**Wymaga roli**: admin

**Guard**: Użytkownicy bez roli admin są przekierowywani do `/profile`

**Elementy**:

- Przycisk powrotu do profilu
- Statystyki:
  - Łącznie feedbacków
  - Sesji z feedbackami
  - Średnia ocena
- Lista **FeedbackCard** pogrupowanych po `chatId`

---

## Nawigacja główna

**Plik**: `frontend/src/components/ui/navbar.tsx`

Stała dolna belka nawigacyjna (widoczna tylko dla zalogowanych użytkowników):

| Ikona       | Label    | Ścieżka         |
| ----------- | -------- | --------------- |
| 🔍 Search   | Szukaj   | `/start-search` |
| 🔖 Bookmark | Zapisane | `/saved`        |
| 📜 History  | Historia | `/history`      |
| 👤 User     | Profil   | `/profile`      |

Aktywna zakładka jest podświetlona kolorem `primary`.

---

## Diagramy flow użytkownika

### Flow główny

```
┌─────────────────┐
│  Landing Page   │
│       (/)       │
└────────┬────────┘
         │ "Rozpocznij"
         ▼
┌─────────────────┐     Niezalogowany
│     Login       │◄────────────────────┐
│    (/login)     │                     │
└────────┬────────┘                     │
         │ Google OAuth                  │
         ▼                              │
┌─────────────────┐                     │
│  Start Search   │─────────────────────┘
│ (/start-search) │     Redirect if not authenticated
└────────┬────────┘
         │ Submit form
         ▼
┌─────────────────┐
│   Chat View     │
│  (/chat/$id)    │
│                 │
│ ┌─────────────┐ │
│ │  Interview  │ │ ◄── Pytania AI
│ └──────┬──────┘ │
│        │        │
│        ▼        │
│ ┌─────────────┐ │
│ │  Searching  │ │ ◄── Pasek postępu
│ └──────┬──────┘ │
│        │        │
│        ▼        │
│ ┌─────────────┐ │
│ │Recommendations│ │ ◄── Lista produktów
│ └─────────────┘ │
└─────────────────┘
```

### Flow refinementu (doprecyzowania)

```
┌─────────────────────┐
│   Recommendations   │
│  (wyniki podstawowe)│
└──────────┬──────────┘
           │ "Wybierz prezenty"
           ▼
┌─────────────────────┐
│   Selection Mode    │
│ (wybór produktów)   │
└──────────┬──────────┘
           │ "Doprecyzuj"
           ▼
┌─────────────────────┐
│  Confirm Dialog     │
└──────────┬──────────┘
           │ Confirm
           ▼
┌─────────────────────┐
│   Chat View         │
│ (nowa runda pytań)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Recommendations   │
│ (nowa tura wyników) │
└─────────────────────┘
```

### Flow opinii (feedback)

```
┌─────────────────────┐
│   Recommendations   │
└──────────┬──────────┘
           │ "Oceń wyniki"
           ▼
┌─────────────────────┐
│    Review Mode      │
│  (klikaj produkty)  │
├─────────────────────┤
│ [Produkt] → Dialog  │
│ [Ogólna opinia] →   │
│   Dialog            │
└──────────┬──────────┘
           │ Submit
           ▼
┌─────────────────────┐
│  Feedback zapisany  │
│  (toast success)    │
└─────────────────────┘
```

---

## Stany aplikacji i komunikaty błędów

### Stany ładowania

- `ChatShimmer` - skeleton podczas ładowania czatu
- "Ładowanie..." - tekstowe komunikaty w widokach

### Stany puste

- Historia: "Brak historii wyszukiwań"
- Zapisane: "Brak zapisanych prezentów"
- Rekomendacje: "Nie znaleziono prezentów"

### Błędy

- "Błąd podczas ładowania informacji o rozmowie"
- "Błąd podczas ładowania rozmów"
- "Nie udało się załadować zapisanych prezentów"
- Toast notifications dla operacji (dodawanie/usuwanie ulubionych, feedback)

---

## Integracja z backendem

### Endpointy API używane przez frontend

| Endpoint                     | Metoda   | Opis                            |
| ---------------------------- | -------- | ------------------------------- |
| `/stalking-request`          | POST     | Rozpoczęcie wyszukiwania        |
| `/messages/chat/{chatId}`    | GET      | Pobranie wiadomości czatu       |
| `/send-message`              | POST     | Wysłanie wiadomości użytkownika |
| `/chats`                     | GET      | Lista sesji użytkownika         |
| `/chats/{chatId}`            | GET      | Szczegóły sesji                 |
| `/chats/{chatId}/listings`   | GET      | Produkty z sesji                |
| `/favorites`                 | GET/POST | Ulubione produkty               |
| `/favorites/{listingId}`     | DELETE   | Usunięcie z ulubionych          |
| `/feedback`                  | POST     | Wysłanie opinii                 |
| `/feedback/chat/{chatId}`    | GET      | Opinie dla sesji                |
| `/user-profiles`             | GET      | Profile osób                    |
| `/chats/{chatId}/refinement` | POST     | Rozpoczęcie refinementu         |

### SSE (Server-Sent Events)

Endpoint: `/sse?clientId={clientId}`

Zdarzenia:

- `chat-question` - nowe pytanie od AI
- `chat-interview-completed` - koniec wywiadu
- `chat-inappropriate-request` - niestosowne żądanie
- `gift-ready` - produkty gotowe do wyświetlenia
