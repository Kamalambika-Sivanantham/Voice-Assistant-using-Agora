import { AgoraClient, Area } from 'agora-agents';
import { DEFAULT_AGENT_UID } from './agora';

export { DEFAULT_AGENT_UID };

/**
 * Creates an AgoraClient configured to target the official Agora Conversational AI
 * API gateway (https://api.agora.io/api/conversational-ai-agent/v2/projects/{appid}/join),
 * ensuring the global endpoint prefix 'api' is tried first before regional routing.
 */
export function createAgoraClient(appId: string, appCertificate: string): AgoraClient {
  const client = new AgoraClient({
    area: Area.US,
    appId,
    appCertificate,
  });

  const pool = client.pool as unknown as {
    regionPrefixes?: string[];
    currentRegionPrefixes?: string[];
  };

  if (pool && Array.isArray(pool.regionPrefixes)) {
    const withoutApi = pool.regionPrefixes.filter((p) => p !== 'api');
    pool.regionPrefixes = ['api', ...withoutApi];
    pool.currentRegionPrefixes = ['api', ...withoutApi];
  }

  return client;
}
