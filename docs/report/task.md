# Jak przygotować końcowy raport z ZPI: Przewodnik dla studentów

**Raport techniczny**
W ramach ZPI (**Zespołowe Przedsięwzięcie Inżynierskie**) zespoły mają obowiązek przygotować raport techniczny podsumowujący ich projekt i osiągnięte wyniki. Realizowane projekty są zorientowane inżyniersko, więc artykuł powinien mieć profesjonalną strukturę, która pozwoli na klarowne przedstawienie kluczowych aspektów projektu.

Poniższy dokument przeprowadzi Cię przez wymaganą strukturę i wskazówki dotyczące formatowania.

---

## Struktura raportu

Raport powinien składać się z trzech głównych sekcji: **Identyfikacja projektu**, **Treść właściwa** oraz **Wnioski**.

### A. Identyfikacja projektu

**1. Tytuł projektu**

- Powinien być zwięzły, ale jednocześnie oddawać istotę projektu.
- Można dodać podtytuł, który podkreśli główny rezultat.
- _Uwaga:_ Prawdopodobnie zdefiniowaliście tytuł podczas przygotowywania fiszki, ale na tym etapie możecie go zmienić.

**2. Autorzy i afiliacje**

- Wypiszcie imiona członków zespołu oraz ich role (jeśli dotyczy).
- Podajcie nazwisko opiekuna projektu oraz jego afiliację z Politechniki Wrocławskiej.

**3. Abstrakt**

- **Długość:** 100-150 słów.
- Jest to skondensowana wersja raportu, pozwalająca innym szybko zrozumieć jego istotę.
- Powinien zawierać: cel projektu, wyniki i ich znaczenie.

### B. Treść właściwa

**4. Wstęp**

- Podajcie krótki opis problemu, który Wasz projekt miał rozwiązać, wraz z tłem problemu.
- Jasno określcie cele projektu w kontekście biznesowym lub technicznym, wyjaśniając ich praktyczne znaczenie.
- Wskażcie cele, które zespół chciał osiągnąć, oraz podkreślcie spodziewane korzyści.

**5. Prace związane z tematem**

- Przedstawcie krótką analizę istniejących rozwiązań i technologii związanych z Waszym projektem.
- **Analiza konkurencji:** Jeśli projekt dotyczy produktu potencjalnie komercyjnego, przeanalizujcie produkty konkurencji i podkreślcie, czym Wasz projekt się wyróżnia.
- Omówcie główne założenia projektowe: wybór technologii, ograniczenia czasowe, zasoby i napotkane problemy.

**6. Wyniki (Najważniejsza sekcja)**
Podajcie szczegółowy opis osiągniętych wyników w projekcie. Sekcja ta powinna odpowiadać na pytania:

- Jakie funkcjonalności zostały zaimplementowane?
- Jakie cele biznesowe lub techniczne zostały osiągnięte?
- _Dane:_ Dołączcie dane lub metryki pokazujące silne strony projektu (np. wydajność, oszczędności, wyniki testów).
- _Zastosowanie:_ Omówcie praktyczne zastosowanie projektu, jego implementację lub potencjalne korzyści dla użytkowników.

> **Wskazówka:** Chociaż szczegóły dotyczące metodologii i technologii są ważne, powinny być przedstawione zwięźle (najlepiej we wstępie), aby zachować koncentrację na wynikach i ich praktycznym znaczeniu.

### C. Wnioski i zakończenie

**7. Wnioski**

- Podsumujcie wyniki, które osiągnęliście, oraz ich znaczenie dla docelowej grupy odbiorców.
- Wskażcie najważniejszy sukces projektu.

**8. Kierunki rozwoju**

- Zaproponujcie możliwe kierunki rozwoju projektu w przyszłości.
- Rozważcie, jakie dodatkowe funkcje mogłyby zostać dodane lub jak projekt mógłby zostać ulepszony.

**9. Podziękowania (Opcjonalne)**

- Krótkie podziękowanie dla osób lub organizacji, które wspierały Twój projekt.

**10. Bibliografia**

- Lista źródeł wykorzystanych podczas realizacji (dokumentacje techniczne, tutoriale, prace naukowe cytowane w artykule).

---

## Wymagania techniczne i formatowanie

| Wymaganie     | Szczegóły                                                                         |
| :------------ | :-------------------------------------------------------------------------------- |
| **Długość**   | **6 stron**                                                                       |
| **Język**     | Język studiów (chyba że z opiekunem ustalono język angielski).                    |
| **Narzędzie** | LaTeX (skorzystajcie z dostarczonego szablonu, aby zachować profesjonalny układ). |

## Ostateczne wskazówki

1. **Jasność i zwięzłość:** Raport powinien być klarowny.
2. **Priorytety:** Główny nacisk połóżcie na **wyniki i ich praktyczne znaczenie**, a nie na samą implementację techniczną.
3. **Korekta:** Przeczytajcie raport przed wysłaniem, aby upewnić się, że jest poprawny językowo i merytorycznie.

Postępując zgodnie z tymi wskazówkami i korzystając z szablonu, stworzycie profesjonalny raport skutecznie prezentujący Wasz projekt. Powodzenia!

---

## Proponowany Outline Raportu (AI Present Finder)

### A. Identyfikacja projektu

- Tytuł: AI Present Finder
- Autorzy: Bartosz Gotowski (DevOps, Stalking), Dawid Chudzicki (Frontend, Fetch), Szymon Kowaliński (Chat, Gift Ideas), Marcin Dolatowski (Fetch, Reranking, Testy)
- Opiekun: [wpisać imię i nazwisko, afiliacja PWr]
- Abstrakt (100–150 słów): cel, podejście (social-data + wywiad AI + multi-source fetch + reranking + SSE), kluczowe wyniki (czas do wyników ~7–8 min, 12 pytań, 116→70 produktów, satysfakcja 80%, TOP‑1 64%), krótka wzmianka o architekturze i wdrożeniu.

### B. Treść właściwa

#### 4. Wstęp

- Problem: trudność doboru trafionych prezentów przy dużej liczbie ofert i braku kontekstu o odbiorcy.
- Cel: skrócić czas i zwiększyć trafność rekomendacji łącząc publiczne dane społecznościowe i konwersacyjny wywiad.
- Zakres MVP: stalking (Instagram/TikTok/X), chat (Gemini), gift ideas (GPT‑4o), fetch (OLX/Allegro/eBay/Amazon), reranking (Gemini‑lite), SSE, OAuth+JWT, persystencja w Postgres.
- Kryteria sukcesu: czas do wyników, subiektywna trafność, stabilność i przejrzyste uzasadnienia AI.

#### 5. Prace związane z tematem

- Przegląd narzędzi konkurencyjnych: DreamGift, GiftAssistant, Giftruly, IntelliGift.
- Nasze przewagi: social scraping (BrightData datasets) + multi‑source fetch + AI reranking z pełnym uzasadnieniem + live SSE + linki do ofert.
- Ograniczenia i założenia: niskie koszty (VPS), brak danych prywatnych, tylko źródła publiczne; ograniczenia providerów e‑commerce.

#### 6. Wyniki (najważniejsze)

- Architektura (C4 v0.2.0): frontend (React+SSE), REST API, stalking, chat, gift‑ideas, fetch x4, reranking, RabbitMQ; zewnętrzne: OpenAI, Google Gemini, BrightData; każdy serwis z własną bazą Postgres.
- Przepływ zdarzeń: stalking→keywords→chat→gift‑ideas→fetch→reranking→SSE; kluczowe eventy (StalkingCompletedEvent, ChatInterviewCompletedEvent, ProductFetchedEvent, GiftContextInitializedEvent).
- Metryki produkcyjne (30.11.2025) – patrz `docs/report/data-collection.md`:
  - Średni czas do pierwszych ofert: 464 s (~7.7 min).
  - Średnia liczba pytań asystenta: 12.
  - Produkty/sesję: 116 (przed) → ~70 (po filtracji).
  - Rozkład providerów: OLX ~99%, Allegro ~1% (fetch działa dla 4 źródeł).
  - Stabilność: kolejki RabbitMQ puste, PM2 9 procesów, RAM ~769 MB, koszt ~20–25 USD/mies.
- Studium przypadku:
  - Skrót transkrypcji wywiadu (14 pytań) z anonimizacją.
  - Top‑10 rekomendacji (np. głośniki Bluetooth) z linkami.
  - Pełne uzasadnienia rerankingu (oceny 10/9/1) z tabeli w `data-collection.md`.
- Jakość rekomendacji:
  - Subiektywnie: 80% satysfakcji, 64% TOP‑1 trafność (deklaratywne).
  - Reranking: eliminuje niepasujące wyniki (np. samochody dla zapytania o fotele/książki), promuje trafne – z pełnym uzasadnieniem AI.

### C. Wnioski i zakończenie

#### 7. Wnioski

- Najważniejszy rezultat: ~3–8 minut do trafionej rekomendacji dzięki połączeniu social‑data + chat + multi‑fetch + reranking + SSE.
- Wartość: skrócenie czasu wyboru i zmniejszenie szumu (116→70), transparentność decyzji AI podnosi zaufanie.
- Ograniczenia: dominacja OLX w danych, latencja pierwszych wyników zależna od stalkingu/fetch, brak A/B.

#### 8. Kierunki rozwoju

- Więcej źródeł (Ceneo/Empik/Media Expert), balansowanie providerów, caching, równoleglenie i batching fetchy.
- Ewaluacja jakości: feedback loop użytkowników, metryki offline/online, personalizacja budżetu i preferencji.
- Prywatność: polityka retencji, panel danych użytkownika, doprecyzowanie podstawy prawnej (RODO).
- Modele: aktualizacje wersji i warianty kosztowo‑wydajnościowe.

#### 9. Etyka i prywatność (propozycja 1‑zdaniowa)

- Przetwarzamy wyłącznie publiczne dane; administratorem jest zespół projektowy; podstawą przetwarzania jest uzasadniony interes świadczenia funkcji rekomendacyjnych; dane ograniczamy do minimum i przechowujemy z retencją właściwą dla MVP.

#### 10. Bibliografia (propozycje)

- Vercel AI SDK (generateObject/generateText)
- OpenAI API (GPT‑4o)
- Google AI (Gemini 2.5‑flash / 2.5‑flash‑lite)
- NestJS 11 + CQRS, TypeORM, RabbitMQ, PostgreSQL
- BrightData datasets (social profiles/posts)
- TanStack Router/Query, SSE (MDN)

#### Załączniki (poza 6 stronami)

- Diagramy C4 (Container/Component), fragment ERD (chats/messages/listings; gift_sessions/products), screenshoty UI, przykładowe sekwencje.
