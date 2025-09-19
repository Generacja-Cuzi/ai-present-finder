// application/handlers/fetch-olx.handler.ts
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { FetchOlxQuery } from '../../domain/queries/fetch-olx.query';
import { ListingDto } from 'src/domain/models/listing.dto';

type ClientHeaders = Partial<Record<string, string>>;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

@QueryHandler(FetchOlxQuery)
export class FetchOlxHandler implements IQueryHandler<FetchOlxQuery, ListingDto[]> {
  private readonly logger = new Logger(FetchOlxHandler.name);

  constructor() {}

  async execute(queryTemp: FetchOlxQuery): Promise<ListingDto[]> {
    const { query, limit, offset, clientHeaders } = queryTemp as FetchOlxQuery & {
      clientHeaders?: ClientHeaders;
    };

    const graphqlBody = {
      query: `
        query ListingSearchQuery($searchParameters: [SearchParameter!] = { key: "", value: "" }) {
          clientCompatibleListings(searchParameters: $searchParameters) {
            __typename
            ... on ListingSuccess {
              data {
                title
                url
                description
                photos { link }
                params {
                  key
                  value {
                    __typename
                    ... on PriceParam {
                      value
                      label
                      currency
                      negotiable
                    }
                  }
                }
              }
            }
            ... on ListingError {
              error { code title status detail }
            }
          }
        }
      `,
      variables: {
        searchParameters: [
          { key: 'offset', value: String(offset) },
          { key: 'limit', value: String(limit) },
          { key: 'query', value: query },
          { key: 'filter_refiners', value: 'spell_checker' },
          { key: 'suggest_filters', value: 'true' },
        ],
      },
    };

    const baseHeaders: Record<string, string> = {
      'content-type': 'application/json',
      'accept': 'application/json',
      'origin': 'https://www.olx.pl',
      'referer': 'https://www.olx.pl/',
      'x-client': 'DESKTOP',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    const envCookie = process.env.OLX_COOKIE;
    if (envCookie) baseHeaders['cookie'] = envCookie;

    const fwd = (clientHeaders ?? {}) as Record<string, string>;
    const headers: Record<string, string> = {
      ...baseHeaders,
      ...(fwd['user-agent'] ? { 'user-agent': fwd['user-agent'] } : {}),
      ...(fwd['accept-language'] ? { 'accept-language': fwd['accept-language'] } : {}),
      ...(fwd['cookie'] ? { 'cookie': fwd['cookie'] } : {}),
    };

    const maxRetries = 4;
    let attempt = 0;

    while (true) {
      attempt++;

      let res: Response;
      try {
        res = await fetch('https://www.olx.pl/apigateway/graphql', {
          method: 'POST',
          body: JSON.stringify(graphqlBody),
          headers,
          redirect: 'manual',
          referrer: 'https://www.olx.pl/',
          referrerPolicy: 'strict-origin-when-cross-origin',
        });
      } catch (e: any) {
        if (attempt <= maxRetries) {
          const base = Math.min(4000, 500 * Math.pow(2, attempt - 1));
          const jitter = Math.floor(Math.random() * 300);
          const delayMs = base + jitter;
          this.logger.warn(`OLX transport error, retry #${attempt} in ${delayMs}ms`);
          await sleep(delayMs);
          continue;
        }
        throw e;
      }

      const status = res.status;

      if (status >= 200 && status < 300) {
        const ctype = res.headers.get('content-type') || '';
        if (!ctype.includes('application/json')) {
          const text = await res.text().catch(() => '');
          const snippet = text.slice(0, 300) + (text.length > 300 ? '…' : '');
          this.logger.warn(`OLX 2xx but non-JSON content-type (${ctype}). Body[0..300]: ${snippet}`);
          throw new Error('Unexpected OLX response structure');
        }

        const json: any = await res.json().catch(() => ({}));

        const payload =
          json?.data?.clientCompatibleListings ??
          json?.clientCompatibleListings ??
          null;

        if (Array.isArray(json?.errors) && json.errors.length) {
          const firstErr = json.errors[0];
          const msg =
            firstErr?.message ||
            `GraphQL error (${firstErr?.extensions?.code ?? 'UNKNOWN'})`;
          throw new Error(msg);
        }

        if (!payload || typeof payload !== 'object') {
          const keys = Object.keys(json || {});
          const dataKeys = Object.keys(json?.data || {});
          this.logger.error(
            `Unexpected OLX response: topKeys=${JSON.stringify(
              keys,
            )}, dataKeys=${JSON.stringify(dataKeys)}`,
          );
          throw new Error('Unexpected OLX response structure');
        }

        if (payload.__typename !== 'ListingSuccess') {
          const err = (payload as any)?.error;
          const msg = err
            ? `OLX error: ${err?.status ?? ''} ${err?.code ?? ''} ${err?.title ?? ''} ${err?.detail ?? ''}`.trim()
            : 'OLX ListingError';
          throw new Error(msg);
        }

        const items = Array.isArray(payload.data) ? payload.data : [];

        const listings: ListingDto[] = items.map((item: any) => {
          const raw = item?.photos?.[0]?.link ?? null;
          const image =
            typeof raw === 'string'
              ? raw.replace('{width}', '1200').replace('{height}', '800')
              : null;

          const priceParam = (item?.params ?? []).find((p: any) => p?.key === 'price');
          const priceValue = priceParam?.value ?? null;

          return {
            image,
            title: item?.title ?? '',
            description: item?.description ?? '',
            link: item?.url ?? '',
            price: {
              value: typeof priceValue?.value === 'number' ? priceValue.value : null,
              label: priceValue?.label ?? null,
              currency: priceValue?.currency ?? null,
              negotiable: typeof priceValue?.negotiable === 'boolean' ? priceValue.negotiable : null,
            },
          } as ListingDto;
        });

        this.logger.log(
          `Fetched ${listings.length} OLX listings for query="${query}" (limit=${limit}, offset=${offset})`,
        );
        return listings;
      }

      if ([403, 429].includes(status) || status >= 500) {
        let bodySnippet = '';
        try {
          const text = await res.text();
          bodySnippet = text.slice(0, 300) + (text.length > 300 ? '…' : '');
        } catch {
          bodySnippet = '<no-body>';
        }
        this.logger.warn(`OLX non-2xx (${status}). Body[0..300]: ${bodySnippet}`);

        if (attempt <= maxRetries) {
          const base = Math.min(4000, 500 * Math.pow(2, attempt - 1));
          const jitter = Math.floor(Math.random() * 300);
          const delayMs = base + jitter;
          this.logger.warn(`OLX retry #${attempt} in ${delayMs}ms (anti-bot/throttle)`);
          await sleep(delayMs);
          continue;
        }
      }

      throw new Error(`HTTP_${status}`);
    }
  }
}
