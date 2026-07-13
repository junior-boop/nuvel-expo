import { server_url } from '@/constants/server_url';
import { apiRequest } from './token_system';

export interface AiAgentResponse {
    success: boolean;
    answer?: string;
    message?: string;
    error?: string;
}

export async function askAiAgent(content: string, question: string): Promise<AiAgentResponse> {
    const response = await apiRequest(`${server_url}/ai/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, question }),
    });

    return response.json();
}
