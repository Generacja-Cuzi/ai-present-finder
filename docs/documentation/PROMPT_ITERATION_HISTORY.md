# Historia iteracji promptów AI w projekcie AI Present Finder

Ten dokument opisuje ewolucję promptów AI w projekcie - od pierwszej wersji do obecnego stanu. Dokumentuje problemy które napotkaliśmy oraz rozwiązania które wdrożyliśmy.

---

## Przegląd chronologiczny

| Data       | Commit    | Opis zmiany                                             | Prompt            |
| ---------- | --------- | ------------------------------------------------------- | ----------------- |
| 11.09.2025 | `0bd3038` | Pierwsza wersja prompta - prosty 3-fazowy wywiad        | Chat              |
| 12.09.2025 | `37b72a6` | Tłumaczenie na polski                                   | Chat              |
| 12.09.2025 | `5b6cb0b` | Powrót do angielskiego - lepsze wyniki                  | Chat              |
| 12.09.2025 | `be20680` | Pierwsza duża iteracja prompt engineeringu - format XML | Chat              |
| 15.09.2025 | `0f3c32b` | Integracja POC chatbota z mikroserwisami                | Chat              |
| 03.10.2025 | `2c43ab7` | Ostateczne przejście na polski                          | Chat              |
| 11.10.2025 | `a1739b2` | **Pierwszy prompt gift-ideas** - generowanie pomysłów   | Gift Ideas        |
| 14.10.2025 | `2428f06` | **Pierwszy prompt stalking** - ekstrakcja faktów        | Stalking          |
| 16.10.2025 | `b868511` | Dodanie occasion (okazji) do kontekstu chatu            | Chat              |
| 18.10.2025 | `9358751` | Implementacja narzędzia `propose_answers`               | Chat              |
| 18.10.2025 | `682022d` | Duża iteracja prompt engineeringu dla chatu             | Chat              |
| 20.10.2025 | `3e899b7` | **Pierwszy prompt reranking** - scoring produktów       | Reranking         |
| 21.10.2025 | `9467892` | Migracja z OpenAI do Gemini                             | Chat              |
| 21.10.2025 | `a0f71fc` | Enforce tool choice + logging                           | Chat              |
| 22.10.2025 | `ebf6bdc` | Rozbudowa reranking service z AI                        | Reranking         |
| 24.10.2025 | `c8fa0b3` | Kompleksowe usprawnienia wywiadu (#103)                 | Chat              |
| 29.10.2025 | `a44aab6` | Refaktoring prompta gift ideas (#126)                   | Gift Ideas        |
| 02.11.2025 | `cb6ffe6` | Batched processing + score-products-flow                | Reranking         |
| 04.11.2025 | `2dbe5d2` | Poprawki logiki rerankingu, filtrowanie top 50          | Reranking         |
| 18.11.2025 | `a227b48` | **Wielka iteracja** prompt engineeringu (#163)          | Chat + Gift Ideas |
| 22.11.2025 | `926615e` | Auto-retry dla brakujących tool calls                   | Chat              |
| 24.11.2025 | `d5cea61` | Dodanie logiki refinement                               | Chat + Gift Ideas |
| 27.11.2025 | `4f63621` | **Refinement prompt** - doprecyzowanie (#173)           | Chat (nowy)       |
| 30.11.2025 | `4c82c97` | Dodanie platformy Okazje.info                           | Gift Ideas        |
| 30.11.2025 | `c12a43a` | Auto-naprawa tool calls                                 | Chat              |

---

## Faza 1: Pierwszy prompt (wrzesień 2025)

### Commit `0bd3038` - 11.09.2025

**Pierwsza wersja prompta dla konsultanta prezentowego**

```
You are a highly skilled Personal Gift Consultant...
Your goal is to gather enough rich, qualitative detail to produce
a comprehensive profile that can be used to find the perfect gift.
```

**Struktura:**

- **Part I**: Understanding the Recipient's World (5 pytań)
- **Part II**: Understanding the Gifting Context (5 pytań)
- **Part III**: Synthesis and Final Output

**Narzędzia:**

- `proceed_to_next_phase()` - przejście między fazami
- `end_conversation()` - zakończenie z profilem
- `flag_inappropriate_request()` - dla nieetycznych próśb

**Problemy tej wersji:**

1. ❌ Za mało pytań (10 łącznie) - niewystarczające dane
2. ❌ Brak konkretnych kategorii eksploracji
3. ❌ Angielski język - użytkownicy w Polsce
4. ❌ Brak struktury outputu

---

### Commit `37b72a6` - 12.09.2025

**Próba tłumaczenia na polski**

**Problem:** Model gorzej radził sobie z polskimi instrukcjami - generował mniej spójne odpowiedzi i częściej "gubił" kontekst.

### Commit `5b6cb0b` - 12.09.2025

**Powrót do angielskiego**

**Wniosek:** Na tym etapie angielski prompt dawał lepsze wyniki. Zdecydowaliśmy kontynuować w angielskim.

---

### Commit `be20680` - 12.09.2025

**Pierwsza duża iteracja - format XML**

Przejście z markdown na strukturę XML:

```xml
<system>
  <role>...</role>
  <goal>...</goal>
  <conversation>
    <style>...</style>
    <part id="I" name="Understanding the Recipient">...</part>
    <part id="II" name="Understanding the Gift Context">...</part>
  </conversation>
</system>
```

**Kluczowe zmiany:**

1. ✅ Zwiększenie pytań w Part I z 5 do 15
2. ✅ Dodanie konkretnych obszarów eksploracji (Daily Routines, Hobbies, Personal Environment, itd.)
3. ✅ Bardziej szczegółowy format outputu
4. ✅ Usunięcie Part III (synteza) - bezpośrednie zakończenie
5. ✅ Lista rzeczy do unikania (avoid)

**Nowe obszary pytań:**

- Daily Routines & Rituals
- Hobbies & Activities (How)
- Personal Environment
- Sensory Preferences
- Media Consumption
- Recent Life & Conversation

---

## Faza 2: Rozbudowa systemu (październik 2025)

### Commit `2c43ab7` - 03.10.2025

**Ostateczne przejście na polski**

Po ulepszeniu struktury prompta, przejście na polski nie pogarszało już jakości. Model lepiej radził sobie z XML-ową strukturą.

---

### Commit `2428f06` - 14.10.2025

**Stalking Service - ekstrakcja faktów z social media**

Nowy prosty prompt do wyciągania faktów z profili:

```
Jesteś ekspertem w wyciąganiu konkluzji i faktów z opisów
z social mediów oraz zdjęć.
```

**Output:** Lista faktów o osobie przydatnych do doboru prezentu.

---

### Commit `682022d` - 18.10.2025

**Duża iteracja chat prompta**

**Problemy rozwiązane:**

1. Model zadawał pytania w 2. osobie ("Czy lubisz...") zamiast 3. osobie ("Czy ON/ONA lubi...")
2. Pytania były zbyt abstrakcyjne ("Jaki styl?")
3. Brak licznika pytań - rozmowy były za krótkie

---

### Commit `9467892` - 21.10.2025

**Migracja z OpenAI do Gemini**

**Powód:** Gemini lepiej obsługiwał tool calls i był bardziej niezawodny w strukturyzowanych odpowiedziach.

**Zmiany techniczne:**

- `@ai-sdk/openai` → `@ai-sdk/google`
- Dostosowanie parametrów modelu
- Zmiana narzędzia `propose_answers`

---

### Commit `ebf6bdc` - 22.10.2025

**Reranking Service - ocena produktów**

Nowy prompt do oceny trafności prezentów:

```xml
<system>
  <role>Jesteś ekspertem w ocenie trafności prezentów dla konkretnych odbiorców.</role>
  <scoring>
    1-3: Słabe dopasowanie
    4-6: Średnie dopasowanie
    7-8: Dobre dopasowanie
    9-10: Doskonałe dopasowanie
  </scoring>
</system>
```

**Kryteria oceny:**

- Relevance (najwyższy priorytet)
- Lifestyle fit (wysoki)
- Preferences (wysoki)
- Occasion (średni)
- Uniqueness (średni)
- Practicality (średni)

---

### Commit `c8fa0b3` - 24.10.2025

**Kompleksowe usprawnienia wywiadu (#103)**

Wielki PR z wieloma zmianami:

1. **Narzędzie `propose_answers`** - AI proponuje odpowiedzi do wyboru
2. **Migracja do Gemini** z lepszym enforce tool choice
3. **Retry logic** dla błędów tool call
4. **Mocowanie pierwszego pytania** dla spójności
5. **Zwiększenie TOTAL_STEPS** z 18 do 20

**Nowe funkcje flow:**

```typescript
// Retry przy błędzie tool call
if (toolCallError) {
  messages.push({ role: "user", content: "Please try again..." });
  // retry
}
```

---

### Commit `a44aab6` - 29.10.2025

**Refaktoring prompta gift ideas (#126)**

Stworzenie dedykowanego prompta do generowania pomysłów na prezenty i zapytań wyszukiwawczych.

**Struktura:**

- Analiza profilu użytkownika
- Generowanie 6-8 pomysłów na prezenty
- 16 zapytań wyszukiwawczych (4 per platforma: Allegro, OLX, eBay, Amazon)

**Problemy rozwiązane:**

- ❌ Zapytania były w angielskim → ✅ Wszystkie po polsku
- ❌ Za długie zapytania → ✅ Max 5 wyrazów
- ❌ Brak związku z profilem → ✅ Priorytet key_themes_and_keywords

---

## Faza 3: Wielka iteracja (listopad 2025)

### Commit `a227b48` - 18.11.2025

**Wielka iteracja prompt engineeringu (#163)**

Największa zmiana w historii projektu - **921 linii zmian** w prompt.ts.

**Główne problemy rozwiązane:**

#### Problem 1: Za krótkie rozmowy

```xml
<rule id="11">⏰ DŁUGA ROZMOWA: MINIMUM 30 pytań - ABSOLUTNIE ZAKAZANE
KOŃCZENIE WCZEŚNIEJ!!! SPRAWDŹ conversation_progress!</rule>
```

Dodanie licznika pytań:

```xml
<conversation_progress>
  <current_question_number>15</current_question_number>
  <questions_remaining_to_minimum>15</questions_remaining_to_minimum>
  <status>MUSISZ ZADAĆ PRZYNAJMNIEJ 15 PYTAŃ WIĘCEJ!!!</status>
</conversation_progress>
```

#### Problem 2: Powtarzanie tych samych obszarów

```xml
<diversity_rule>
  ⚠️ Eksploruj RÓŻNE obszary życia - MINIMUM 5 RÓŻNYCH!
  - Jeśli zacząłeś od pracy → przejdź do: dom, hobby, kulinaria...
  - Jeśli zacząłeś od hobby → przejdź do: praca, dom, zdrowie...
</diversity_rule>
```

#### Problem 3: Zawsze zaczynanie od pracy

```xml
<rule id="5">🔍 NIE ZACZYNAJ ZAWSZE OD PRACY! BĄDŹ KREATYWNY!</rule>

<exploration_leads>
  🎯 KREATYWNE POCZĄTKI (NIE PRACA!):
  - "Czy ma jakieś hobby czy zainteresowania?"
  - "Czy uprawia jakiś sport?"
  - "Czy lubi gotować?"
  - "Czy podróżuje?"
  - "Czy ma zwierzęta domowe?"
</exploration_leads>
```

#### Problem 4: Pytania o 2. osobę

```xml
<rule id="2">👤 TRZECIA osoba (on/ona) - NIGDY druga osoba (ty)</rule>
```

#### Problem 5: Zbyt abstrakcyjne pytania

```xml
<rule id="3">🎁 Pytaj PRODUKTOWO (kategorie, sprzęt, posiadanie)
NIE abstrakcyjnie (style, preferencje)</rule>

<product_mindset>
  ✓ "Czy ma dobre słuchawki?" → słuchawki/audio
  ✗ "Jaki rodzaj muzyki?" → nie prowadzi do prezentu
</product_mindset>
```

#### Problem 6: Drążenie po "nie wiem"

```xml
<nie_wiem_rule>
  ⚠️ User: "Nie wiem"
  → NATYCHMIAST nowy wątek (zmień obszar!)
  ✓ "Czy ma słuchawki?" → "Nie wiem" → "Czy pracuje zdalnie?" (PRACA)
  ✗ "Czy ma słuchawki?" → "Nie wiem" → "A głośniki?" (TEN SAM obszar!)
</nie_wiem_rule>
```

#### Nowa struktura possessions

```xml
<possessions>
  what_already_has: Rzeczy które osoba JUŻ MA
  what_is_missing: Rzeczy których BRAKUJE
</possessions>
```

---

### Commit `926615e` - 22.11.2025

**Auto-retry dla brakujących tool calls**

**Problem:** Model czasami odpowiadał tekstem zamiast wywołać narzędzie.

**Rozwiązanie:** Dodanie przypomnienia w prompcie i automatyczny retry:

```typescript
if (!hasToolCall) {
  messages.push({
    role: "user",
    content:
      "PRZYPOMNIENIE: Musisz użyć narzędzia ask_a_question_with_answer_suggestions!",
  });
  // retry
}
```

---

### Commit `4f63621` - 27.11.2025

**Refinement Prompt (#173)**

Nowy prompt dla trybu doprecyzowania po wyborze produktów przez użytkownika.

**Scenariusz:** Użytkownik zobaczył rekomendacje i wybrał 3 produkty które mu się podobają. Teraz AI zadaje 3-5 krótkich pytań aby zrozumieć CO DOKŁADNIE mu się podoba.

```xml
<role>Jesteś Doradcą Prezentowym w TRYBIE DOPRECYZOWANIA -
użytkownik wybrał produkty które mu się podobają.</role>

<goal>
  Zadaj 3-5 KRÓTKICH pytań aby zrozumieć:
  1. CO DOKŁADNIE w wybranych produktach się podoba?
  2. Jakie WSPÓLNE CECHY tych produktów są najważniejsze?
  3. Jakie NOWE key_themes powinny być użyte?
</goal>
```

**Przykładowe pytania:**

- "Co w tych produktach najbardziej Ci się podoba?"
- "Czy cena jest kluczowym czynnikiem?"
- "Czy kategoria jest idealna czy może inna też by pasowała?"

---

### Commit `c12a43a` - 30.11.2025

**Auto-naprawa tool calls**

**Problem:** Gemini czasami generował niepoprawne parametry narzędzi.

**Rozwiązanie:** Automatyczna naprawa i retry:

```typescript
try {
  validateToolCall(result);
} catch (validationError) {
  // Napraw automatycznie lub poproś o poprawkę
  messages.push({
    role: "user",
    content: `Niepoprawne wywołanie narzędzia: ${validationError.message}. Spróbuj ponownie.`,
  });
}
```

---

## Wnioski i lessons learned

### Co działało dobrze:

1. **Format XML** - lepszy niż markdown dla strukturyzowanych instrukcji
2. **Konkretne przykłady** - model lepiej rozumie z przykładami rozmów
3. **Listy zakazów** - wyraźne "nie rób X" działa lepiej niż "rób Y"
4. **Liczniki i statusy** - model lepiej kontroluje długość rozmowy
5. **Retry mechanizmy** - automatyczne naprawianie błędów

### Co nie działało:

1. **Zbyt ogólne instrukcje** - "zadaj dobre pytania" → model nie wie co robić
2. **Brak priorytetów** - wszystko równie ważne = nic nie ważne
3. **Angielski dla polskich użytkowników** - niespójność językowa
4. **Za mało pytań** - 10 pytań to za mało na dobry profil

### Kluczowe metryki poprawy:

- Liczba pytań: 10 → 30 (3x więcej danych)
- Obszary eksploracji: 6 → 16+ (2.5x więcej różnorodności)
- Retry success rate: ~60% → ~95% (dzięki auto-naprawie)
- User satisfaction: znacząco wyższa po iteracji #163

---

## Aktualna architektura promptów

```
backend/
├── chat-microservice/src/app/ai/
│   ├── prompt.ts              # Główny wywiad (762 linie)
│   └── refinement-prompt.ts   # Tryb doprecyzowania (265 linii)
│
├── stalking-microservice/src/app/ai/
│   └── prompt.ts              # Ekstrakcja faktów z social media (21 linii)
│
├── gift-ideas-microservice/src/app/ai/
│   └── prompt.ts              # Generowanie pomysłów i zapytań (391 linii)
│
└── reranking-microservice/src/app/ai/
    └── prompt.ts              # Ocena produktów (92 linie)
```

**Łącznie: ~1531 linii promptów**

---

## Szczegółowa historia per prompt

### 1. Chat Prompt (`chat-microservice/src/app/ai/prompt.ts`)

**Cel:** Przeprowadzenie wywiadu z użytkownikiem aby zebrać informacje o obdarowywanym.

| Data  | Commit    | Zmiana                                     |
| ----- | --------- | ------------------------------------------ |
| 11.09 | `0bd3038` | Pierwsza wersja - prosty 3-fazowy wywiad   |
| 12.09 | `be20680` | Format XML, rozbudowa obszarów eksploracji |
| 15.09 | `0f3c32b` | Integracja z mikroserwisami                |
| 03.10 | `2c43ab7` | Przejście na język polski                  |
| 16.10 | `b868511` | Dodanie occasion (okazji) do kontekstu     |
| 18.10 | `9358751` | Narzędzie `propose_answers`                |
| 18.10 | `682022d` | Duża iteracja prompt engineeringu          |
| 21.10 | `9467892` | Migracja na Gemini                         |
| 24.10 | `c8fa0b3` | Retry logic, mock first question           |
| 18.11 | `a227b48` | **WIELKA ITERACJA** - 921 linii zmian      |
| 22.11 | `926615e` | Auto-retry dla tool calls                  |
| 30.11 | `c12a43a` | Auto-naprawa tool calls                    |

**Kluczowe problemy rozwiązane:**

- Za krótkie rozmowy (10 → 30 pytań minimum)
- Pytania w 2. osobie → zasada 3. osoby
- Zbyt abstrakcyjne pytania → podejście produktowe
- Brak różnorodności → minimum 5 różnych obszarów
- Drążenie po "nie wiem" → natychmiastowa zmiana wątku

---

### 2. Refinement Prompt (`chat-microservice/src/app/ai/refinement-prompt.ts`)

**Cel:** Doprecyzowanie preferencji po wyborze produktów przez użytkownika.

| Data  | Commit    | Zmiana                        |
| ----- | --------- | ----------------------------- |
| 27.11 | `4f63621` | Utworzenie prompta refinement |
| 30.11 | `c12a43a` | Auto-naprawa tool calls       |

**Scenariusz użycia:**

1. Użytkownik widzi rekomendacje produktów
2. Wybiera 3+ produkty które mu się podobają
3. AI zadaje 3-5 krótkich pytań o wspólne cechy
4. Aktualizuje `key_themes` dla lepszych wyników

---

### 3. Stalking Prompt (`stalking-microservice/src/app/ai/prompt.ts`)

**Cel:** Ekstrakcja faktów o osobie z profili social media.

| Data  | Commit    | Zmiana                  |
| ----- | --------- | ----------------------- |
| 14.10 | `01d537d` | Pierwszy prompt         |
| 14.10 | `6913c5c` | Poprawki                |
| 14.10 | `2428f06` | Finalna wersja w PR #45 |

**Struktura:**

```xml
<role>Ekspert w wyciąganiu konkluzji z social mediów</role>
<goal>Wypisanie faktów przydatnych do doboru prezentu</goal>
<output>Lista faktów o osobie</output>
```

**Przykładowe outputy:**

- "Lubi podróże, szczególnie do ciepłych krajów"
- "Interesuje się fotografią analogową"
- "Ma kota, często publikuje zdjęcia pupila"

---

### 4. Gift Ideas Prompt (`gift-ideas-microservice/src/app/ai/prompt.ts`)

**Cel:** Generowanie pomysłów na prezenty i zapytań wyszukiwawczych.

| Data  | Commit    | Zmiana                                  |
| ----- | --------- | --------------------------------------- |
| 11.10 | `a1739b2` | Pierwszy prompt - 78 linii              |
| 29.10 | `a44aab6` | Rozbudowa do 391 linii (#126)           |
| 18.11 | `3cdd125` | Dostosowanie do nowego schematu profilu |
| 24.11 | `d5cea61` | Integracja z refinement                 |
| 30.11 | `4c82c97` | Dodanie platformy Okazje.info           |

**Kluczowe zmiany:**

- Początkowe zapytania były po angielsku → wszystkie po polsku
- Za długie zapytania → max 5 wyrazów
- Brak związku z profilem → priorytet `key_themes_and_keywords`
- Dodanie platformy Okazje.info (30.11)

**Struktura outputu:**

```json
{
  "gift_ideas": ["pomysł 1", "pomysł 2", ...],
  "search_queries": [
    { "query": "...", "service": "allegro" },
    { "query": "...", "service": "olx" },
    { "query": "...", "service": "ebay" },
    { "query": "...", "service": "amazon" },
    { "query": "...", "service": "okazje" }
  ]
}
```

**Zakaz słów (chyba że w key_themes):**

- "vintage", "retro", "klasyczny", "elegancki"
- "premium", "luksusowy", "używany"

---

### 5. Reranking Prompt (`reranking-microservice/src/app/ai/prompt.ts`)

**Cel:** Ocena trafności produktów dla konkretnego odbiorcy.

| Data  | Commit    | Zmiana                                  |
| ----- | --------- | --------------------------------------- |
| 20.10 | `3e899b7` | Pierwszy prompt - ranking.service.ts    |
| 22.10 | `ebf6bdc` | Rozbudowa z emit-gift-ready             |
| 02.11 | `cb6ffe6` | Batched processing, score-products-flow |
| 04.11 | `2dbe5d2` | Filtrowanie top 50, score > 5           |

**Skala ocen:**
| Score | Znaczenie |
|-------|-----------|
| 1-3 | Słabe dopasowanie |
| 4-6 | Średnie dopasowanie |
| 7-8 | Dobre dopasowanie |
| 9-10 | Doskonałe dopasowanie |

**Kryteria oceny (priorytet):**

1. Relevance (najwyższy)
2. Lifestyle fit (wysoki)
3. Preferences (wysoki)
4. Occasion (średni)
5. Uniqueness (średni)
6. Practicality (średni)

**Filtrowanie:** Tylko produkty z score ≥ 5 są wysyłane użytkownikowi.

---

## Ewolucja narzędzi AI (Tools)

Oprócz promptów, ewoluowały też narzędzia dostępne dla modelu AI.

### Chat Tools (`chat-microservice/src/app/ai/tools.ts`)

| Data  | Commit    | Zmiana                                                                                        |
| ----- | --------- | --------------------------------------------------------------------------------------------- |
| 15.09 | `0f3c32b` | Pierwsze narzędzia: `proceed_to_next_phase`, `end_conversation`, `flag_inappropriate_request` |
| 18.10 | `9358751` | Dodanie `propose_answers` - sugestie odpowiedzi                                               |
| 21.10 | `9467892` | Zmiana na `ask_a_question_with_answer_suggestions` (Gemini)                                   |
| 24.10 | `c8fa0b3` | Rozbudowa schematów, required parameters                                                      |

**Aktualne narzędzia:**

1. **`ask_a_question_with_answer_suggestions`**
   - Zadaje pytanie z 4 opcjami do wyboru lub wolną odpowiedzią
   - Parametry: `question`, `potentialAnswers`

2. **`end_conversation`**
   - Kończy rozmowę z finalnym profilem
   - Parametry: `output` (recipient_profile, key_themes, possessions)

3. **`flag_inappropriate_request`**
   - Oznacza nieetyczne/nielegalne prośby
   - Parametry: `reason`

---

## Modele AI wykorzystane w projekcie

| Serwis           | Model         | SDK              | Od kiedy         |
| ---------------- | ------------- | ---------------- | ---------------- |
| Chat             | Google Gemini | `@ai-sdk/google` | 21.10.2025       |
| Chat (wcześniej) | OpenAI GPT-4  | `@ai-sdk/openai` | 11.09-21.10.2025 |
| Stalking         | OpenAI GPT-4  | `@ai-sdk/openai` | 14.10.2025       |
| Gift Ideas       | OpenAI GPT-4  | `@ai-sdk/openai` | 11.10.2025       |
| Reranking        | Google Gemini | `@ai-sdk/google` | 20.10.2025       |

**Powód migracji chatu na Gemini:**

- Lepsze wsparcie dla tool calls
- Bardziej niezawodne strukturyzowane odpowiedzi
- Mniejsze opóźnienia

---

## Podsumowanie statystyk

| Metryka                       | Wartość                     |
| ----------------------------- | --------------------------- |
| Liczba promptów               | 5                           |
| Łączna liczba linii           | ~1531                       |
| Commitów dotyczących promptów | 25+                         |
| Okres rozwoju                 | 11.09 - 30.11.2025 (80 dni) |
| Największa zmiana             | `a227b48` - 921 linii       |
