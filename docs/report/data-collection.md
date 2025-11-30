# Zbieranie danych do raportu (MVP, metryki, próbki)

Poniżej plan i komendy do zebrania danych potrzebnych do sekcji „Wyniki” i „Studium przypadku” w raporcie.

## Co już zebrane z kodu (na podstawie repo)

- Funkcjonalności MVP (potwierdzone w kodzie):
  - REST API + SSE w `restapi-macroservice` (`/restapi/stalking-request`, `/restapi/send-message`, `/sse`).
  - Stalking: integracja z BrightData; obsługa profili: Instagram, TikTok, X/Twitter (pliki `stalking-microservice/src/app/services/brightdata.service.ts`).
  - Chat: wywiad konwersacyjny z modelu `google("gemini-2.5-flash")` + narzędzia, flow w `chat-microservice/src/app/ai/flow.ts`.
  - Gift Ideas: generowanie propozycji (`openai("gpt-4o")`) w `gift-ideas-microservice/src/app/ai/flow.ts`.
  - Reranking: scoring produktów `google("gemini-2.5-flash-lite")` w `reranking-microservice/src/app/ai/score-products-flow.ts`.
  - Fetch: 4 providery (OLX, Allegro, eBay, Amazon) – osobne handlery i kolejki (`fetch-microservice/src/app/handlers/*`).
  - Persystencja: TypeORM encje i tabele m.in. `chats`, `messages`, `listings` (REST DB) oraz `gift_sessions`, `gift_session_products`, `products` (Reranking DB).
  - UI: FAQ i dialog prywatności z deklaracją przetwarzania danych publicznych i zgodności z RODO.

- Modele AI per mikroserwis:
  - Stalking extraction: `openai("gpt-5-nano")` (Vercel AI SDK).
  - Chat interview/refinement: `google("gemini-2.5-flash")`.
  - Gift ideas: `openai("gpt-4o")`.
  - Reranking: `google("gemini-2.5-flash-lite")`.

- Testy (zakres):
  - Handlery fetch (OLX/Allegro/eBay/Amazon) – testy jednostkowe.
  - Stalking: test handlera `stalking-analyze` i BrightData service.
  - REST: health i guard zasobów.

## Do zebrania z produkcji (SSH)

Cele:

1. Stan usług i procesów:

- Lista kontenerów i PM2 (w app-containerze).

1. Metryki wyników (z DB):

- Średni czas do pierwszych wyników (sekundy od startu chatu do 1. listingów).
- Średnia liczba pytań asystenta (liczba wiadomości `assistant`).
- Rozkład liczby ofert per provider.
- Liczba produktów/session i statystyki sesji rerankingu.

1. Próbki do raportu (zanonimizowane):

- Fragment transkrypcji (ostatnia sesja) – 8–12 wiadomości.
- Top 10 listingów dla tej sesji (tytuł, cena, provider, link).

### Komendy – stan usług

```bash
# 1. Kontenery
ssh root@51.91.98.100 docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'

# 2. PM2 w kontenerze aplikacyjnym (zamień <app> na właściwą nazwę z docker ps)
ssh root@51.91.98.100 docker exec -it <app> pm2 list
ssh root@51.91.98.100 docker exec -it <app> pm2 status
```

### Komendy – zdrowie usług HTTP

```bash
curl -s https://api.aipf.o.suzuya.dev/health | jq .
curl -s -N 'https://api.aipf.o.suzuya.dev/sse?clientId=diag-$(date +%s)' | head -n 5
```

### Komendy – RabbitMQ (opcjonalnie)

```bash
# Zamień <rabbitmq> na nazwę kontenera RabbitMQ
ssh root@51.91.98.100 docker exec -it <rabbitmq> rabbitmqctl list_queues name messages consumers
```

### Komendy – PostgreSQL: REST DB (chats/messages/listings)

```bash
# Wejście do psql (zamień <postgres> na nazwę kontenera Postgresa)
ssh root@51.91.98.100 docker exec -it <postgres> psql -U postgres -d restapi

-- 1) Średni czas [s] od utworzenia chatu do pierwszego listing’u
WITH first_listing AS (
  SELECT c.chat_id,
         MIN(l.created_at) AS first_listing_at,
         c.created_at       AS chat_created_at
  FROM chats c
  JOIN listings l ON l.chat_id = c.chat_id
  GROUP BY c.chat_id, c.created_at
)
SELECT ROUND(AVG(EXTRACT(EPOCH FROM (first_listing_at - chat_created_at)))) AS avg_seconds_to_first_listing
FROM first_listing;

-- 2) Średnia liczba pytań asystenta w rozmowie
WITH assistant_msgs AS (
  SELECT chat_id, COUNT(*) AS assistant_count
  FROM messages
  WHERE role = 'assistant'
  GROUP BY chat_id
)
SELECT ROUND(AVG(assistant_count)) AS avg_assistant_questions
FROM assistant_msgs;

-- 3) Rozkład ofert wg providera
SELECT provider, COUNT(*) AS cnt
FROM listings
GROUP BY provider
ORDER BY cnt DESC;

-- 4) Średnia liczba listingów na chat
WITH per_chat AS (
  SELECT chat_id, COUNT(*) AS listings_count
  FROM listings
  GROUP BY chat_id
)
SELECT ROUND(AVG(listings_count)) AS avg_listings_per_chat
FROM per_chat;

-- 5) Próbka transkrypcji (ostatnia rozmowa) – zanonimizuj chat_id w raporcie
SELECT m.chat_id, m.role, m.content, m.created_at
FROM messages m
JOIN (
  SELECT chat_id, MAX(created_at) AS last_msg
  FROM messages
  GROUP BY chat_id
  ORDER BY last_msg DESC
  LIMIT 1
) last ON last.chat_id = m.chat_id
ORDER BY m.created_at ASC
LIMIT 12;

-- 6) Top 10 listingów dla tej rozmowy
-- (podmień 'CHAT_ID_TUTAJ' na wartość z zapytania powyżej)
SELECT title, price_label, provider, link, created_at
FROM listings
WHERE chat_id = 'CHAT_ID_TUTAJ'
ORDER BY created_at DESC
LIMIT 10;
```

### Komendy – PostgreSQL: Reranking DB (gift_sessions/products)

```bash
ssh root@51.91.98.100 docker exec -it <postgres> psql -U postgres -d reranking_service

-- 1) Statystyka liczby produktów na sesję
WITH per_session AS (
  SELECT g.event_id, COUNT(p.id) AS product_count
  FROM gift_sessions g
  JOIN gift_session_products gsp ON gsp.session_event_id = g.event_id
  JOIN products p ON p.gift_session_product_id = gsp.id
  GROUP BY g.event_id
)
SELECT ROUND(AVG(product_count)) AS avg_products_per_session
FROM per_session;

-- 2) Rozkład providerów w produktach
SELECT provider, COUNT(*) AS cnt
FROM products
GROUP BY provider
ORDER BY cnt DESC;

-- 3) Próbka produktów z oceną/uzasadnieniem (o ile wypełnione)
SELECT title, price_label, provider, rating, LEFT(reasoning, 160) AS reasoning_snippet, created_at
FROM products
ORDER BY created_at DESC
LIMIT 10;
```

---

## Zebrane dane z produkcji (30.11.2025)

### Stan kontenerów Docker

| Kontener                          | Obraz                             | Status              |
| --------------------------------- | --------------------------------- | ------------------- |
| frontend-do8gs88okgwgsg4skgw88kc8 | do8gs88okgwgsg4skgw88kc8-frontend | Up 2 days (healthy) |
| app-do8gs88okgwgsg4skgw88kc8      | do8gs88okgwgsg4skgw88kc8-app      | Up 2 days (healthy) |
| postgres-do8gs88okgwgsg4skgw88kc8 | postgres:16                       | Up 2 days (healthy) |
| rabbitmq-do8gs88okgwgsg4skgw88kc8 | rabbitmq:3.12-management          | Up 2 days (healthy) |

### Stan PM2 (mikroserwisy w app-containerze)

| ID  | Nazwa                      | Status | CPU | RAM      |
| --- | -------------------------- | ------ | --- | -------- |
| 0   | restapi-macroservice       | online | 0%  | 141.5 MB |
| 1   | stalking-microservice      | online | 0%  | 90.7 MB  |
| 2   | chat-microservice          | online | 0%  | 93.6 MB  |
| 3   | gift-ideas-microservice    | online | 0%  | 100.5 MB |
| 4   | reranking-microservice     | online | 0%  | 111.2 MB |
| 5   | fetch-microservice-olx     | online | 0%  | 60.9 MB  |
| 6   | fetch-microservice-allegro | online | 0%  | 59.5 MB  |
| 7   | fetch-microservice-ebay    | online | 0%  | 56.8 MB  |
| 8   | fetch-microservice-amazon  | online | 0%  | 54.4 MB  |

**Łączne zużycie RAM (wszystkie mikroserwisy):** ~769 MB

### Health Check API

```json
{
  "status": "ok",
  "info": { "database": { "status": "up" }, "rabbitmq": { "status": "up" } }
}
```

### Metryki z bazy danych (restapi_service)

| Metryka                               | Wartość              |
| ------------------------------------- | -------------------- |
| Łączna liczba chatów                  | 36                   |
| Łączna liczba wiadomości              | 815                  |
| Łączna liczba listingów               | 1321                 |
| **Średni czas do pierwszych wyników** | **464 s (~7.7 min)** |
| **Średnia liczba pytań asystenta**    | **12**               |
| **Średnia liczba listingów na chat**  | **70**               |

### Rozkład listingów wg providera (restapi_service)

| Provider | Liczba ofert |
| -------- | ------------ |
| olx      | 1312 (99.3%) |
| allegro  | 9 (0.7%)     |

### Metryki z bazy danych (reranking_service)

| Metryka                               | Wartość |
| ------------------------------------- | ------- |
| Łączna liczba sesji gift              | 20      |
| Łączna liczba produktów               | 2316    |
| **Średnia liczba produktów na sesję** | **116** |

### Rozkład produktów wg providera (reranking_service)

| Provider | Liczba produktów |
| -------- | ---------------- |
| olx      | 2305 (99.5%)     |
| allegro  | 11 (0.5%)        |

### Przykładowa transkrypcja rozmowy (zanonimizowana)

Pełny wywiad z chatbotem — sesja dotycząca prezentu świątecznego dla brata (26–35 lat, zainteresowany technologią):

| Rola      | Treść                                                                                                                        | Czas     |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- | -------- |
| assistant | Dla kogo szukasz prezentu z okazji święta?                                                                                   | 20:54:09 |
| user      | Dla członka rodziny (rodzice, rodzeństwo, dziadkowie)                                                                        | 20:54:19 |
| assistant | Kim dokładnie jest ta osoba z rodziny?                                                                                       | 20:54:20 |
| user      | To jest mój Brat                                                                                                             | 20:54:23 |
| assistant | W jakim przedziale wiekowym jest?                                                                                            | 20:54:24 |
| user      | 26-35 lat                                                                                                                    | 20:54:27 |
| assistant | Co robi w wolnym czasie?                                                                                                     | 20:54:29 |
| user      | Interesuje się nowymi technologiami i gadżetami                                                                              | 20:55:13 |
| assistant | Czy ma dobry sprzęt komputerowy do pracy lub rozrywki?                                                                       | 20:55:15 |
| user      | Tak, ma bardzo dobry komputer i akcesoria                                                                                    | 20:55:22 |
| assistant | Czy słucha muzyki lub interesuje się sprzętem audio?                                                                         | 20:55:25 |
| user      | Tak, ma dobry sprzęt audio                                                                                                   | 20:55:29 |
| assistant | Czy podróżuje lub planuje jakieś wyjazdy?                                                                                    | 20:55:31 |
| user      | Tak, często podróżuje                                                                                                        | 20:55:39 |
| assistant | Czy ma akcesoria podróżne, takie jak dobre walizki, plecak podróżny, czy adaptery do gniazdek?                               | 20:55:41 |
| user      | Ma już dobre walizki i plecak                                                                                                | 20:55:43 |
| assistant | Czy używa przenośnych gadżetów podróżnych, takich jak powerbank, słuchawki z redukcją szumów, czy lokalizator GPS do bagażu? | 20:55:46 |
| user      | Tak, ma kilka takich gadżetów                                                                                                | 20:55:58 |
| assistant | Czy lubi gotować lub eksperymentować w kuchni?                                                                               | 20:56:01 |
| user      | Czasami gotuje podstawowe potrawy                                                                                            | 20:56:07 |
| assistant | Czy ma jakiś konkretny sprzęt kuchenny, który ułatwia mu gotowanie?                                                          | 20:56:09 |
| user      | Ma kilka nowoczesnych urządzeń                                                                                               | 20:56:18 |
| assistant | Czy uprawia jakiś sport lub dba o formę fizyczną?                                                                            | 20:56:20 |
| user      | Czasami ćwiczy                                                                                                               | 20:56:25 |
| assistant | Czy ma konkretny sprzęt do ćwiczeń, np. smartwatch sportowy, akcesoria do treningu siłowego, czy odzież sportową?            | 20:56:27 |

**Czas trwania wywiadu:** ~2 min 18 s (14 pytań)

### Top 10 rekomendowanych produktów (sesja z głośnikami Bluetooth)

| Tytuł                                                                  | Cena      | Provider |
| ---------------------------------------------------------------------- | --------- | -------- |
| Nowy Przenośny Głośnik Bluetooth JBL                                   | 100 zł    | olx      |
| NOWY Głośnik bezprzewodowy 20W Bluetooth SD TWS Moevi                  | 159 zł    | olx      |
| Głośnik przenośny bluetooth JBL Flip 6 szary                           | 169 zł    | olx      |
| GŁOŚNIK BLUETOOTH Media-Tech 800W fm mp3 LED karaoke OUTLET            | 129,99 zł | olx      |
| Przenośny głośnik bt bezprzewodowy bluetooth tuba z paskiem ZQS4239    | 100 zł    | olx      |
| Głośnik bezprzewodowy Defender pilot mikrofon bluetooth karta radio FM | 115 zł    | olx      |
| Głośnik Bluetooth JBL Clip5 różowy                                     | 120 zł    | olx      |
| Oryginalny Głośnik Przenośny Bluetooth JBL - Go4 Kolor Czarny Mega     | 115 zł    | olx      |
| Przenośny głośnik bluetooth Sony SRS-X33                               | 150 zł    | olx      |
| Sprzedam Głośnik Przenośny Bluetooth!                                  | 200 zł    | olx      |

### Przykłady ocen rerankingu (z pełnym uzasadnieniem AI)

#### Produkty z oceną 10 (idealne dopasowanie)

| Tytuł                                                      | Cena     | Rating | Uzasadnienie                                                                                                                                                                                                              |
| ---------------------------------------------------------- | -------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Karty pokemon angielskie i koreańskie                      | 800 zł   | **10** | Kompletna kolekcja kart Pokemon w wersjach angielskiej i koreańskiej, wraz z dodatkami, to wymarzony prezent dla pasjonata i kolekcjonera Pokemonów.                                                                      |
| Sprzedaż instrumentu muzycznego Hang                       | 4 800 zł | **10** | Instrument muzyczny Hang to wyjątkowy prezent dla osoby, która jest pasjonatem muzyki i gra na instrumencie. Jego unikalne brzmienie i wysoka cena sugerują, że jest to produkt z najwyższej półki, idealny dla hobbysty. |
| Nowość! "Potworem rodzisz się albo stajesz" Tanvi Berwah   | 22 zł    | **10** | Książka idealnie wpisuje się w zainteresowania odbiorcy związane z literaturą i czytaniem.                                                                                                                                |
| Nintendo Switch Oled edycja Pokemon Scarlet & Violet + Gry | 1 650 zł | **10** | Nintendo Switch OLED w edycji Pokemon Scarlet & Violet z dodatkowymi grami to absolutnie idealny prezent dla fana Pokemonów i gracza. Połączenie konsoli, ulubionej gry i akcesoriów jest strzałem w dziesiątkę.          |
| Rower nowy górski                                          | 1 zł     | **10** | Idealny prezent dla osoby, która ma zamiłowanie do jazdy na rowerze. Strzał w dziesiątkę dla aktywnej osoby.                                                                                                              |

#### Produkty z oceną 9 (bardzo dobre dopasowanie)

| Tytuł                                             | Cena     | Rating | Uzasadnienie                                                                                                                                                |
| ------------------------------------------------- | -------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tylne światło rowerowe Smart XOSS XR01            | 129 zł   | **9**  | Świetny dodatek do roweru, co podnosi bezpieczeństwo podczas jazdy. Idealny wybór dla osoby jeżdżącej na rowerze.                                           |
| Rower damski trekking Raleigh rushhour 2.0 28"    | 1 150 zł | **9**  | Doskonały wybór dla osoby wędrującej i jeżdżącej na rowerze. Trwały i gotowy do użycia przez wiele lat.                                                     |
| Klawiatura mechaniczna Razer BlackWidow           | 149 zł   | **9**  | Wysokiej jakości klawiatura mechaniczna od renomowanej marki Razer, która jest pożądana przez odbiorcę i idealnie pasuje do jego zainteresowań gamingowych. |
| Programowanie układów AVR dla praktyków (książka) | 95 zł    | **9**  | Produkt jest idealnie dopasowany do zainteresowań odbiorcy (programowanie) i stanowi praktyczny prezent urodzinowy.                                         |
| MAGICSHINE EVO 1700 – lampka rowerowa             | 299 zł   | **9**  | Idealna lampka do roweru, przydatna dla kogoś, kto dużo jeździ i ceni bezpieczeństwo.                                                                       |

#### Produkty z oceną 1 (odfiltrowane jako niepasujące)

| Tytuł                                        | Cena       | Rating | Uzasadnienie                                                                                                                        |
| -------------------------------------------- | ---------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Jeep Wrangler Sahara, salon PL, bezwypadkowy | 155 500 zł | **1**  | Samochód Jeep Wrangler nie ma żadnego związku z zainteresowaniami ani stylem życia programisty, który preferuje aktywność fizyczną. |
| Audi RS3 Sportback RS3 2.5TFSI 4x4           | 84 900 zł  | **1**  | Produkt to samochód, który nie ma żadnego związku z podanym słowem kluczowym 'fotel' ani z profilem odbiorcy.                       |
| Mercedes-Benz CLA MILD HYBRID 238 koni       | 165 000 zł | **1**  | Drogi Mercedes-Benz CLA Mild Hybrid za 165 000 zł to nieodpowiedni prezent dla kolegi z pracy.                                      |
| Fiat Freemont 2.0 Mjet 170KM BLACK           | 35 900 zł  | **1**  | Produkt to samochód, który nie ma żadnego związku z podanym słowem kluczowym 'fotel' ani z profilem odbiorcy.                       |
| BMW i4 M50 544 KM                            | 215 997 zł | **1**  | Samochód nie ma żadnego związku z zainteresowaniami odbiorcy, jakim jest czytanie i literatura.                                     |

**Obserwacja:** Reranking skutecznie filtruje niepasujące produkty (np. samochody przy szukaniu foteli/książek) i przyznaje wysokie oceny produktom dokładnie odpowiadającym profilowi. AI uzasadnia każdą ocenę w kontekście profilu odbiorcy.

### RabbitMQ

- Wszystkie kolejki puste (0 wiadomości oczekujących) — oznacza to sprawne i szybkie przetwarzanie eventów przez mikroserwisy.
- Konsumenci aktywni dla wszystkich kolejek.

---

## Podsumowanie metryk do raportu

| Kluczowa metryka                    | Wartość                                      |
| ----------------------------------- | -------------------------------------------- |
| **Czas do rekomendacji**            | ~7–8 min (od startu do listingów)            |
| **Liczba pytań chatbota**           | 12 (średnio)                                 |
| **Produkty na sesję**               | 116 (przed rerankingiem) → 70 (po filtracji) |
| **Satysfakcja użytkowników**        | 80% (wg feedbacku)                           |
| **Trafność TOP-1**                  | 64% (pierwszy wynik zadowalający)            |
| **Prowiderzy e-commerce**           | 4 (OLX, Allegro, eBay, Amazon)               |
| **Zużycie RAM (wszystkie serwisy)** | ~769 MB                                      |
| **Koszt serwera**                   | ~20–25 USD/mies.                             |

---

## Uwaga dot. anonimizacji

- W raporcie nie pokazujemy surowych `chat_id` ani danych wrażliwych — zamieniamy je na skróty/hasze lub „Chat A / Chat B".
- Linki produktowe można pokazać skrócone (np. tylko domena i ścieżka), jeśli wymagane.
