# TODO: Raport ZPI — AI Present Finder

## ⚠️ KRYTYCZNE BRAKI (muszą być naprawione!)

### 1. DŁUGOŚĆ RAPORTU: 8 → 6 stron ❌

- [ ] Skrócić transkrypcję wywiadu (14 → 6-7 wymian)
- [ ] Skrócić tabelę rerankingu (17 → 8-10 wierszy)
- [ ] Usunąć lub połączyć tabelę PM2 z tabelą kosztów
- [ ] Skondensować sekcję "Infrastruktura i stabilność"
- [ ] Sprawdzić czy po zmianach mamy dokładnie 6 stron

### 2. BRAK RÓL CZŁONKÓW ZESPOŁU ✅

- [x] Zmienić `\members{}` na wersję z rolami:
  - Bartosz Gotowski (DevOps, Stalking)
  - Dawid Chudzicki (Frontend, Fetch)
  - Szymon Kowaliński (Chat, Gift Ideas)
  - Marcin Dolatowski (Fetch, Reranking, Testy)

### 3. BRAK OPIEKUNA NAUKOWEGO ✅

- [x] Uzupełnić `\supervisor{}` — dr inż. Marcin Jodłowiec, Katedra Informatyki Stosowanej, WIT PWr

### 4. SEKCJA "KIERUNKI ROZWOJU" ✅

- [x] Rozbudowano do 7 szczegółowych punktów:
  - Rozszerzenie i balansowanie źródeł e-commerce (OLX 99% → wieloźródłowy)
  - Pamięć kontekstowa i negatywny feedback (już ma X)
  - Dywersyfikacja kategorii produktowych (anty-hiperfokus)
  - Optymalizacja latencji (~8 min → streaming, cache, równoległość)
  - Pętla feedbacku i ewaluacja online (A/B testy, NDCG/MRR)
  - Personalizacja budżetu i okazji
  - Prywatność i zgodność z RODO (retencja, panel użytkownika)

### 5. KRYTERIA SUKCESU WE WSTĘPIE ✅

- [x] Dodano paragraf po celach projektu z 4 kryteriami sukcesu:
  - Czas do wyników < 10 min
  - Subiektywna trafność > 60%
  - Stabilność systemu (0 awarii)
  - Przejrzyste uzasadnienia AI

---

## 🔍 UWAGI Z RECENZJI (Review Feedback)

### 6. SŁOWNICTWO: "stalking" → profesjonalne określenie ✅

- [x] Zmieniono "stalking" → "analiza profili publicznych" lub "OSINT" w abstrakcie
- [x] Zmieniono "stalking-microservice" → "profile-analysis" w opisach (tabele, przepływ, PM2)
- [x] W zakresie MVP już zmienione (TODO 5): "zautomatyzowana analiza profili publicznych"
- [x] W kierunkach rozwoju: "stalkingu" → "analizy profili"
- [x] W rolach członków zespołu: "Stalking" → "Profile Analysis"

### 7. ABSTRAKT: próba badawcza ✅

- [x] Zmieniono "użytkownicy deklarują 80% satysfakcji" → "W pilotażowej grupie testowej (11 opinii z 6 sesji) użytkownicy zadeklarowali średnio 80% satysfakcji"
- [x] Dodano kontekst małej próby i potrzebę walidacji na większej próbie

### 8. WNIOSKI: obrona multi-source ✅

- [x] Dodano zdanie w punkcie "Ograniczenia i ryzyka": "architektura systemu jest w pełni gotowa na wielu providerów — działają 4 niezależne instancje fetch-microservice dla OLX, Allegro, eBay i Amazon; obecna dysproporcja wynika wyłącznie z polityki API zewnętrznych dostawców (rate-limity, geoblokady), nie z ograniczeń systemu"

### 9. SCREENSHOTY UI ✅

- [x] Dodano zrzuty ekranu interfejsu (chat + rekomendacje) w sekcji Wyniki
- [x] Użyto subcaption dla dwóch obrazów obok siebie
- [x] Pliki: `screenshots/chat.png`, `screenshots/rekomendacje_prezentów.png`

### 10. BIBLIOGRAFIA: format wpisów ✅

- [x] Sprawdzono — wszystkie 12 wpisów mają pełny format: autor, tytuł, rok, URL, notatka z datą dostępu
- [x] Wpis książkowy (Newman) ma: autor, tytuł, wydawca, rok, edycja, ISBN
- [x] Format zgodny ze standardem BibTeX

---

## Strona 1: Wstęp (rozbudowany) ✅

- [x] Problem: statystyki czasochłonności (15h, różnice płci)
- [x] Problem: skala nietrafionych prezentów (50%, 9.5 mld USD)
- [x] Frustracje użytkowników (lista 5 bolączek z %)
- [x] Cel i zakres projektu (4 cele + technologie MVP)

## Strona 2: Prace związane + Architektura

- [x] Tabela porównawcza konkurencji (5 kolumn: Narzędzie, Social data, Wywiad AI, Multi-source, Reranking, Live results)
  - DreamGift, GiftAssistant, Giftruly, IntelliGift vs AIPF
- [x] Diagram C4 Container — wstawić `C4_Container.pdf` (placeholder w LaTeX)
- [x] Krótki opis przepływu zdarzeń (1 paragraf pod diagramem)
- [x] Tabela: mikroserwisy + modele AI (6 wierszy: stalking, chat, gift-ideas, reranking, fetch, restapi)

## Strona 3: Wyniki — Metryki + Case Study

- [x] Tabela metryk (czas, pytania, produkty, RAM, koszt) — rozszerzona:
  - [x] Dodano: łączna liczba chatów (36), wiadomości (815), listingów (1321)
- [ ] Wykres/rysunek: rozkład providerów (pie chart OLX 99% / Allegro 1%) — opcjonalne
- [x] Studium przypadku — pełna transkrypcja wywiadu (14 wymian w longtable)
- [x] Top-10 rekomendacji (tabela: tytuł, cena, provider)

## Strona 4: Wyniki — Reranking + Jakość

- [x] Tabela rerankingu — rozszerzona:
  - [x] Dodano więcej przykładów (17 wierszy: oceny 10/9/5/1 z kategoriami)
- [x] Opis mechanizmu rerankingu (model, ocena 1-10, uzasadnienia, próg filtracji)
- [x] Tabela metryk jakościowych (satysfakcja 80%, TOP-1 64%, redukcja 116→70, średnia ocena 3.5/5)
- [x] Obserwacja końcowa o skuteczności filtracji
- [ ] Rysunek: flow rerankingu (produkty → scoring AI → filtracja → TOP-N) — opcjonalne

## Strona 5: Wyniki — DevOps + Stabilność + Koszty ✅

- [x] Tabela PM2 serwisów (9 wierszy: ID, Nazwa, Status, CPU, RAM)
- [x] Paragraf: stabilność (puste kolejki RMQ, health check, 0 restartów, 2 dni uptime)
- [x] Tabela kosztów (VPS, PostgreSQL, RabbitMQ, AI API estymaty)
- [ ] Screenshot UI (1–2 zrzuty: chat + results) — potrzebne pliki PNG/PDF (opcjonalne)

## Strona 6: Wnioski + Kierunki rozwoju + Etyka + Bibliografia ✅

- [x] Wnioski — rozbudowane:
  - [x] 3 bullets: headline result, wartość dla użytkownika, ograniczenia
- [x] Kierunki rozwoju — jest, OK
- [x] Etyka i prywatność — jest, OK
- [x] Bibliografia — uzupełniona `references.bib`:
  - [x] Vercel AI SDK
  - [x] OpenAI API (GPT-4o)
  - [x] Google AI (Gemini 2.5-flash / 2.5-flash-lite)
  - [x] NestJS 11 + CQRS
  - [x] RabbitMQ
  - [x] TypeORM + PostgreSQL
  - [x] BrightData
  - [x] SSE spec (MDN)
  - [x] Consumer Reports (statystyki prezentów)
  - [x] Finder.com (statystyki prezentów)

## Pliki do przygotowania

- [x] `images/C4_Container.png` — diagram architektury (wygenerowany z PlantUML)
- [ ] `images/provider_distribution.pdf` — wykres pie/bar (opcjonalne)
- [ ] `images/reranking_flow.pdf` — diagram flow rerankingu (opcjonalne)
- [ ] `images/screenshot_chat.png` — zrzut UI chat (opcjonalne)
- [ ] `images/screenshot_results.png` — zrzut UI results (opcjonalne)
- [x] `references.bib` — bibliografia (12 pozycji)

## Sprawdzenie końcowe

- [x] Kompilacja LaTeX bez błędów (sukces: 8 stron, 352KB PDF)
- [ ] **KRYTYCZNE:** Sprawdzenie długości (obecnie 8 stron zamiast 6 — wymaga kondensacji)
- [ ] **KRYTYCZNE:** Dodać role członków zespołu do `\members{}`
- [ ] **KRYTYCZNE:** Uzupełnić nazwisko opiekuna naukowego
- [ ] Rozbudować sekcję "Kierunki rozwoju" (obecnie 1 zdanie)
- [ ] Dodać kryteria sukcesu do Wstępu
- [ ] Zamienić "stalking" na profesjonalne określenie
- [ ] Poprawić abstrakt (mała próba badawcza)
- [ ] Dodać obronę multi-source w Wnioskach
- [ ] Wyjaśnić rolę ceny w rerankingu
- [ ] Dodać screenshot UI (opcjonalne, ale zalecane)
- [ ] Sprawdzić format bibliografii
- [ ] Korekta językowa (polszczyzna)
- [x] Weryfikacja wszystkich liczb i metryk (dane z data-collection.md i feedback.md)

## Priorytet napraw

| Prio  | Zadanie                             | Wpływ na ocenę        |
| ----- | ----------------------------------- | --------------------- |
| 🔴 1  | Skondensować do 6 stron             | Wymóg twardy!         |
| 🔴 2  | Dodać role członków zespołu         | Wymóg formalny        |
| 🔴 3  | Uzupełnić opiekuna naukowego        | Wymóg formalny        |
| 🟡 4  | Zamienić "stalking" → profesjonalne | Styl akademicki       |
| 🟡 5  | Poprawić abstrakt (mała próba)      | Wiarygodność          |
| 🟡 6  | Rozbudować Kierunki rozwoju         | Kompletność           |
| 🟡 7  | Dodać obronę multi-source           | Obrona przed zarzutem |
| 🟡 8  | Wyjaśnić rolę ceny w rerankingu     | Głębia analizy        |
| 🟢 9  | Dodać screenshot UI                 | Wizualna prezentacja  |
| 🟢 10 | Sprawdzić format bibliografii       | Styl akademicki       |
| 🟢 11 | Korekta językowa                    | Polish                |

## Pozytywne aspekty raportu (z recenzji) ✅

- ✅ Metryki zamiast odczuć (464s, 20-25 USD, 99.3% OLX)
- ✅ Szczerość techniczna (otwarte przyznanie się do ograniczeń)
- ✅ Nowoczesny stack (NestJS, RabbitMQ, CQRS, RAG/Reranking)
- ✅ Ewaluacja jakościowa (tabela z uzasadnieniami AI)
- ✅ Case Study z transkrypcją rozmowy
- ✅ Konkretne przykłady błędów (Jeep Wrangler)
- ✅ Tabela PM2 ze zużyciem RAM per mikroserwis
- ✅ Sekcja Etyka jako "dupochron" przy skrapowaniu
