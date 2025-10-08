# Fetch Microservice

Microservice odpowiedzialny za fetchowanie produktów z różnych serwisów internetowych (Allegro, Amazon, eBay, OLX).

## Architektura

Fetch Microservice został wydzielony z Gift Microservice w celu zwiększenia skalowalności. Umożliwia uruchomienie wielu instancji mikroservisu, każda specjalizująca się w obsłudze konkretnego dostawcy.

### Komunikacja

- **Otrzymuje**: `FetchAllegroEvent`, `FetchAmazonEvent`, `FetchEbayEvent`, `FetchOlxEvent`
- **Wysyła**: `ProductFetchedEvent`

## Konfiguracja

### Zmienne środowiskowe

Skopiuj `.env.example` do `.env` i skonfiguruj odpowiednie wartości:

```bash
cp .env.example .env
```

#### Podstawowa konfiguracja

```env
# Provider dla tej instancji: allegro, amazon, ebay, olx
FETCH_PROVIDER=allegro

# Nazwa kolejki dla eventów
FETCH_QUEUE_NAME=FetchAllegroEvent

# RabbitMQ
CLOUDAMQP_URL=amqp://admin:admin@localhost:5672
```

#### Konfiguracja dostawców

**Allegro:**

```env
ALLEGRO_CLIENT_ID=your_client_id
ALLEGRO_CLIENT_SECRET=your_client_secret
ALLEGRO_TOKEN_URL=https://allegro.pl.allegrosandbox.pl/auth/oauth/token
ALLEGRO_SEARCH_URL=https://api.allegro.pl.allegrosandbox.pl/offers/listing
```

**Amazon:**

```env
RAPIDAPI_KEY=your_rapidapi_key
AMAZON_API_URL=https://real-time-amazon-data.p.rapidapi.com/search
AMAZON_COUNTRY=PL
```

**eBay & OLX:** Zobacz `.env.example` dla pełnej listy zmiennych.

## Instalacja i uruchomienie

### Instalacja zależności

```bash
npm install
# lub
pnpm install
```

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm run start:prod
```

## Skalowanie

### Uruchomienie wielu instancji

Możesz uruchomić oddzielne instancje dla każdego dostawcy:

**Instancja Allegro:**

```bash
FETCH_PROVIDER=allegro FETCH_QUEUE_NAME=FetchAllegroEvent npm run dev
```

**Instancja Amazon:**

```bash
FETCH_PROVIDER=amazon FETCH_QUEUE_NAME=FetchAmazonEvent npm run dev
```

**Instancja eBay:**

```bash
FETCH_PROVIDER=ebay FETCH_QUEUE_NAME=FetchEbayEvent npm run dev
```

**Instancja OLX:**

```bash
FETCH_PROVIDER=olx FETCH_QUEUE_NAME=FetchOlxEvent npm run dev
```

### Docker

Możesz również utworzyć separate pliki `.env` dla każdej instancji:

- `.env.allegro`
- `.env.amazon`
- `.env.ebay`
- `.env.olx`

I uruchamiać je osobno:

```bash
docker run --env-file .env.allegro fetch-microservice
docker run --env-file .env.amazon fetch-microservice
docker run --env-file .env.ebay fetch-microservice
docker run --env-file .env.olx fetch-microservice
```

## Struktura eventów

### FetchAllegroEvent (input)

```typescript
{
  query: string,           // wyszukiwana fraza
  limit: number,           // limit wyników (domyślnie 20)
  offset: number,          // offset (domyślnie 0)
  requestId: string,       // unikalny identyfikator żądania
  chatId: string          // identyfikator chatu
}
```

### ProductFetchedEvent (output)

```typescript
{
  products: ListingDto[],  // znalezione produkty
  requestId: string,       // identyfikator żądania
  chatId: string,         // identyfikator chatu
  provider: string,       // dostawca: "allegro", "amazon", "ebay", "olx"
  success: boolean,       // czy operacja się powiodła
  error?: string         // opis błędu (jeśli wystąpił)
}
```

## Monitorowanie

Microservice loguje wszystkie operacje. Przykładowe logi:

```
[FetchAllegroHandler] Handling Allegro fetch for query: laptop
[FetchAllegroHandler] Fetched 15 Allegro listings for query="laptop"
```

## Rozwój

### Dodawanie nowego dostawcy

1. Utwórz nowy event w `src/domain/events/fetch-newprovider.event.ts`
2. Utwórz handler w `src/app/handlers/fetch-newprovider.handler.ts`
3. Dodaj handler do `AppModule`
4. Dodaj zmienne środowiskowe do `.env.example`
5. Zaktualizuj dokumentację

### Testowanie

```bash
npm run test
npm run test:e2e
```
