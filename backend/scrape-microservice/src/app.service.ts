import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { ListingPayload } from '@core/types';

export interface ScrapeOkazjeResult {
  query: string;
  url: string;
  totalProducts: number;
  listings: ListingPayload[];
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  async scrapeOkazje(query: string): Promise<ScrapeOkazjeResult> {
    const url = `https://www.okazje.info.pl/search/?q=${encodeURIComponent(query)}`;

    this.logger.log(`Scraping URL: ${url}`);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      this.logger.log(`Successfully scraped ${html.length} characters`);

      const listings = this.parseProducts(html);
      this.logger.log(`Extracted ${listings.length} listings`);

      return {
        query,
        url,
        totalProducts: listings.length,
        listings,
      };
    } catch (error) {
      this.logger.error(
        `Failed to scrape: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private parseProducts(html: string): ListingPayload[] {
    const $ = cheerio.load(html);
    const listings: ListingPayload[] = [];

    // Each product is in a div with class "pB--cr"
    $('.pB--cr').each((index, element) => {
      try {
        const $el = $(element);
        const $link = $el.find('a.pB__href');

        // Extract title
        const title = $el.find('.pB__i--name .pB__href--text').text().trim();

        // Extract price
        const priceText = $el.find('.pB__i--price .priceRegular').text().trim();
        const priceNumeric = this.extractNumericPrice(priceText);

        // Extract shop name
        const shop = $el.find('.pB__i--shop').text().trim();

        // Extract image URL
        const imageUrl = $el.find('.pB__image--src').attr('src') || '';

        // Extract product URL (decode from data-r-hash)
        const redirectHash = $link.attr('data-r-hash') || '';
        const productUrl = this.decodeProductUrl(redirectHash);

        // Extract description
        const description = $el.find('.pB__i--desc').text().trim();

        // Extract parameters
        const params: Record<string, string> = {};
        $el.find('.pB__i--params p').each((_, param) => {
          const text = $(param).text().trim();
          const colonIndex = text.indexOf(':');
          if (colonIndex > 0) {
            const key = text.substring(0, colonIndex).trim();
            const value = text.substring(colonIndex + 1).trim();
            params[key] = value;
          }
        });

        // Only add if we have essential data
        if (title && shop) {
          listings.push({
            image: imageUrl || null,
            title,
            description: description || `${title} - ${shop}`,
            link: productUrl,
            price: {
              value: priceNumeric,
              label: priceText || null,
              currency: 'PLN',
              negotiable: false,
            },
            category: params['Grupa produktowa'] || null,
            provider: shop,
            isFavorited: false,
          });
        }
      } catch (error) {
        this.logger.warn(
          `Failed to parse product at index ${index}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });

    return listings;
  }

  private extractNumericPrice(priceText: string): number | null {
    // Remove all non-numeric characters except comma and dot
    // Polish format: "1 729,00 zł" -> 1729.00
    const cleaned = priceText
      .replace(/\s/g, '') // Remove spaces
      .replace('zł', '') // Remove currency
      .replace(',', '.') // Replace comma with dot
      .replace(/[^\d.]/g, ''); // Remove everything except digits and dot

    const numeric = parseFloat(cleaned);
    return isNaN(numeric) ? null : numeric;
  }

  private decodeProductUrl(redirectHash: string): string {
    if (!redirectHash) return '';

    try {
      // The redirect hash is in format: redirect/?r=BASE64_ENCODED_JSON
      // Extract the base64 part after "r="
      const base64Match = redirectHash.match(/r=([^&]+)/);
      if (!base64Match) return '';

      // URL decode first (e.g., %3D -> =)
      let base64String = decodeURIComponent(base64Match[1]);

      // Decode URL-safe base64 (replace - with +, _ with /)
      base64String = base64String.replace(/-/g, '+').replace(/_/g, '/');

      // Add padding if needed (Base64 requires length to be multiple of 4)
      while (base64String.length % 4 !== 0) {
        base64String += '=';
      }

      // Decode base64 to get JSON string
      const decodedString = Buffer.from(base64String, 'base64').toString(
        'utf-8',
      );

      // Parse JSON to extract the actual URL
      const data = JSON.parse(decodedString) as { url?: string };
      const url = data.url || '';

      // Clean up affiliate/tracking URLs
      return this.cleanAffiliateUrl(url);
    } catch (error) {
      this.logger.warn(
        `Failed to decode product URL from "${redirectHash}": ${error instanceof Error ? error.message : String(error)}`,
      );
      return '';
    }
  }

  private cleanAffiliateUrl(url: string): string {
    if (!url) return '';

    try {
      // Handle TradeDoubler affiliate links (e.g., Empik)
      // Format: https://pdt.tradedoubler.com/click?...url(ENCODED_URL)
      if (url.includes('tradedoubler.com')) {
        const urlMatch = url.match(/url\(([^)]+)\)/);
        if (urlMatch) {
          return decodeURIComponent(urlMatch[1]);
        }
      }

      // Handle other common affiliate patterns
      // Format: ?redirect=ENCODED_URL or &url=ENCODED_URL
      const redirectMatch = url.match(/[?&](redirect|url|target)=([^&]+)/);
      if (redirectMatch) {
        const potentialUrl = decodeURIComponent(redirectMatch[2]);
        // Check if it's a valid URL
        if (potentialUrl.startsWith('http')) {
          return potentialUrl;
        }
      }

      return url;
    } catch (error) {
      this.logger.warn(
        `Failed to clean affiliate URL: ${error instanceof Error ? error.message : String(error)}`,
      );
      return url;
    }
  }
}
