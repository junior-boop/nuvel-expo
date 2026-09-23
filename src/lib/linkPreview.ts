import { server_url } from '@/constants/server_url';
import { apiRequest } from './token_system';

export interface LinkPreviewResponse {
    success: boolean;
    preview?: {
        url: string;
        title: string;
        description: string | null;
        image: string | null;
        domain: string;
    };
    message?: string;
}

export async function fetchLinkPreview(url: string): Promise<LinkPreviewResponse> {
    const response = await apiRequest(`${server_url}/links/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
    }, { screen: 'links/preview' });

    return response.json();
}
