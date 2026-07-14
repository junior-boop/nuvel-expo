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

export interface CorrectTextResponse {
    success: boolean;
    original?: string;
    corrected?: string;
    message?: string;
}

export async function correctText(text: string): Promise<CorrectTextResponse> {
    const response = await apiRequest(`${server_url}/ai/correct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    });

    return response.json();
}
