import { KnowledgeRetrievalOptions, RetrievedSource } from './types';
import { rankSources } from './source-ranking';

/**
 * Executes a web search query using available providers (Tavily / Serper / Wikipedia REST / Authoritative APIs).
 */
export async function executeWebSearch(
  query: string,
  options: KnowledgeRetrievalOptions = {},
): Promise<RetrievedSource[]> {
  const timeoutMs = options.timeoutMs ?? 2500;
  const maxResults = options.maxResults ?? 4;
  const timestamp = new Date().toISOString();

  // Logging for diagnostics
  console.log(`[RETRIEVAL] Triggered for query: "${query}"`);

  // Try Provider 1: Tavily Search API if TAVILY_API_KEY is present
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (tavilyKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query,
          search_depth: 'basic',
          include_answer: false,
          max_results: maxResults,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          const rawSources: RetrievedSource[] = data.results.map(
            (r: { title?: string; url?: string; content?: string; published_date?: string }) => ({
              title: r.title || query,
              url: r.url || 'https://web-search.local',
              sourceName: 'Live Web Search (Tavily)',
              snippet: r.content || '',
              retrievedAt: timestamp,
              publishedAt: r.published_date,
              relevance: 0.9,
            }),
          );
          const ranked = rankSources(rawSources, query);
          console.log(`[RETRIEVAL] Successfully retrieved ${ranked.length} sources from Tavily`);
          return ranked;
        }
      }
    } catch (err) {
      console.warn('[RETRIEVAL] Tavily lookup error:', err);
    }
  }

  // Try Provider 2: Serper Search API if SERPER_API_KEY is present
  const serperKey = process.env.SERPER_API_KEY;
  if (serperKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': serperKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: query, num: maxResults }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const organic = data.organic || [];
        if (Array.isArray(organic) && organic.length > 0) {
          const rawSources: RetrievedSource[] = organic.map(
            (r: { title?: string; link?: string; snippet?: string; date?: string }) => ({
              title: r.title || query,
              url: r.link || 'https://google.com',
              sourceName: 'Live Search (Serper)',
              snippet: r.snippet || '',
              retrievedAt: timestamp,
              publishedAt: r.date,
              relevance: 0.9,
            }),
          );
          const ranked = rankSources(rawSources, query);
          console.log(`[RETRIEVAL] Successfully retrieved ${ranked.length} sources from Serper`);
          return ranked;
        }
      }
    } catch (err) {
      console.warn('[RETRIEVAL] Serper lookup error:', err);
    }
  }

  // Try Provider 3: Authoritative Open Knowledge API (Wikipedia REST API)
  try {
    const directResults = await fetchAuthoritativeDirectData(query, timeoutMs);
    if (directResults.length > 0) {
      console.log(`[RETRIEVAL] Successfully retrieved ${directResults.length} sources from Open Knowledge API`);
      return rankSources(directResults, query);
    }
  } catch (err) {
    console.warn('[RETRIEVAL] Open Knowledge API error:', err);
  }

  // Default fallback: official portal registry without hardcoding specific individual names
  console.log('[RETRIEVAL] Using authoritative portal directory fallback');
  return getAuthoritativeFallbackResults(query, options);
}

/**
 * Fetches structured data directly from authoritative open APIs (e.g. Wikipedia REST API / Official repositories).
 */
async function fetchAuthoritativeDirectData(query: string, timeoutMs: number): Promise<RetrievedSource[]> {
  const timestamp = new Date().toISOString();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Clean search terms for lookup
    const searchTerm = query
      .replace(/who is (the )?(current )?/i, '')
      .replace(/what is (the )?(current |latest )?/i, '')
      .replace(/what are (the )?(current |latest )?/i, '')
      .replace(/tell me about/i, '')
      .replace(/\?/g, '')
      .trim();

    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&utf8=&format=json&srlimit=2`;

    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'AgoraVoiceAssistant/1.0 (info@agora.io)' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (searchRes.ok) {
      const data = await searchRes.json();
      const searchItems = data?.query?.search || [];

      if (Array.isArray(searchItems) && searchItems.length > 0) {
        const topItem = searchItems[0];
        const pageTitle = topItem.title;
        const snippetClean = topItem.snippet.replace(/<[^>]+>/g, '');

        // Fetch page summary
        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;
        const summaryRes = await fetch(summaryUrl, {
          headers: { 'User-Agent': 'AgoraVoiceAssistant/1.0 (info@agora.io)' },
        });

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          return [
            {
              title: summaryData.title || pageTitle,
              url: summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
              sourceName: 'Authoritative Reference (Wikipedia Open Knowledge API)',
              snippet: summaryData.extract || snippetClean,
              retrievedAt: timestamp,
              relevance: 0.95,
              isOfficial: false,
            },
          ];
        }
      }
    }
  } catch {
    // Return empty on error
  } finally {
    clearTimeout(timeoutId);
  }

  return [];
}

/**
 * Authoritative portal directory fallback without hardcoding specific individual office-holders.
 * Points to the official government / institutional portals for verification.
 */
function getAuthoritativeFallbackResults(query: string, _options: KnowledgeRetrievalOptions): RetrievedSource[] {
  const timestamp = new Date().toISOString();
  const q = query.toLowerCase();
  const results: RetrievedSource[] = [];

  // Tamil Nadu Government
  if (q.includes('tamil nadu') || q.includes('tn.gov')) {
    results.push({
      title: 'Government of Tamil Nadu - Official Portal',
      url: 'https://www.tn.gov.in',
      sourceName: 'Official Portal of Tamil Nadu Government (tn.gov.in)',
      snippet: 'Official portal of the Government of Tamil Nadu. For current Ministers, Chief Minister, and state notifications, consult the government directory at tn.gov.in.',
      retrievedAt: timestamp,
      isOfficial: true,
      relevance: 0.9,
      jurisdiction: 'Tamil Nadu, India',
    });
  }
  // Government of India / Prime Minister / Central Ministers
  else if (q.includes('india') || q.includes('prime minister') || q.includes('president') || q.includes('central government')) {
    results.push({
      title: 'National Portal of India & Prime Minister Office',
      url: 'https://www.india.gov.in',
      sourceName: 'National Portal of India (india.gov.in / pmindia.gov.in)',
      snippet: 'Official portal of the Government of India providing official directory of Central Government leaders, Ministers, and national portals.',
      retrievedAt: timestamp,
      isOfficial: true,
      relevance: 0.9,
      jurisdiction: 'India (National)',
    });
  }
  // Python / Software
  else if (q.includes('python')) {
    results.push({
      title: 'Python Releases - Python Software Foundation',
      url: 'https://www.python.org/downloads/',
      sourceName: 'Official Python Software Foundation (python.org)',
      snippet: 'Official download and release notes repository for Python. Consult python.org/downloads for active production release series.',
      retrievedAt: timestamp,
      isOfficial: true,
      relevance: 0.9,
    });
  }
  // General Government Service
  else if (q.includes('passport') || q.includes('aadhaar') || q.includes('pan card') || q.includes('government service')) {
    results.push({
      title: 'Passport Seva / National Public Services Portal',
      url: 'https://www.passportindia.gov.in',
      sourceName: 'Official Government Service Portal (passportindia.gov.in)',
      snippet: 'Official portal for citizen public service applications under the respective Union Ministry.',
      retrievedAt: timestamp,
      isOfficial: true,
      relevance: 0.9,
      jurisdiction: 'India',
    });
  } else {
    results.push({
      title: 'National Portal of India',
      url: 'https://www.india.gov.in',
      sourceName: 'National Portal of India (india.gov.in)',
      snippet: `Authoritative verified reference for ${query}. Consult official portals for real-time notifications.`,
      retrievedAt: timestamp,
      isOfficial: true,
      relevance: 0.7,
    });
  }

  return rankSources(results, query);
}

