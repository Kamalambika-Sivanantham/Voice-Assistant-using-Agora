import { NextRequest, NextResponse } from 'next/server';
import { knowledgeRetriever } from '@/lib/knowledge/retriever';
import { KnowledgeRetrievalOptions } from '@/lib/knowledge/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, options } = body as { query?: string; options?: KnowledgeRetrievalOptions };

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Valid query parameter is required' }, { status: 400 });
    }

    const results = await knowledgeRetriever.search(query, options);
    return NextResponse.json({
      query,
      timestamp: new Date().toISOString(),
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Error in knowledge search API:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Knowledge retrieval failed',
      },
      { status: 500 },
    );
  }
}

