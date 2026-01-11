// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://portfolio-api.jkapa0417.workers.dev';

// Types
export interface Post {
    id: number;
    slug: string;
    title: string;
    title_ko: string | null;
    excerpt: string | null;
    excerpt_ko: string | null;
    content?: string;
    content_ko?: string | null;
    category: string;
    cover_image: string | null;
    read_time: number;
    created_at: string;
}

export interface Comment {
    id: number;
    post_id: number;
    parent_id: number | null;
    author_id: string;
    author_name: string;
    author_avatar: string | null;
    content: string;
    created_at: string;
    replies?: Comment[];
}

export interface User {
    id: string;
    name: string;
    email: string | null;
    avatar: string | null;
    isAdmin: boolean;
}

// Get auth token from storage
function getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
}

// Set auth token
export function setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
}

// Remove auth token
export function removeAuthToken(): void {
    localStorage.removeItem('auth_token');
}

// API fetch wrapper with auth
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAuthToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
    }

    return response.json();
}

// ============ Posts API ============

export async function getPosts(options?: {
    category?: string;
    limit?: number;
    offset?: number;
}): Promise<{ posts: Post[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.category) params.set('category', options.category);
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.offset) params.set('offset', options.offset.toString());

    const query = params.toString();
    return apiFetch(`/api/posts${query ? `?${query}` : ''}`);
}

// Get single post by slug (Admin)
export const getAdminPost = async (slug: string): Promise<Post> => {
    return apiFetch(`/api/posts/admin/${slug}`);
};

export async function getPost(slug: string): Promise<Post> {
    return apiFetch(`/api/posts/${slug}`);
}

export async function getCategories(): Promise<{ categories: string[] }> {
    return apiFetch('/api/posts/meta/categories');
}

// ============ Comments API ============

export async function getComments(postId: number): Promise<{ comments: Comment[]; total: number }> {
    return apiFetch(`/api/comments/post/${postId}`);
}

export async function createComment(data: {
    post_id: number;
    parent_id?: number;
    content: string;
}): Promise<{ success: boolean; comment: Comment }> {
    return apiFetch('/api/comments', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function deleteComment(id: number): Promise<{ success: boolean }> {
    return apiFetch(`/api/comments/${id}`, {
        method: 'DELETE',
    });
}

// ============ Auth API ============

export async function getCurrentUser(): Promise<{ user: User | null }> {
    try {
        return await apiFetch('/api/auth/me');
    } catch {
        return { user: null };
    }
}

export async function getGitHubAuthUrl(): Promise<{ url: string }> {
    return apiFetch('/api/auth/github');
}

export async function getGoogleAuthUrl(): Promise<{ url: string }> {
    return apiFetch('/api/auth/google');
}

export async function logout(): Promise<void> {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    removeAuthToken();
}

// ============ Content API ============

export interface Career {
    id: number;
    company: string;
    company_ko: string | null;
    position: string;
    position_ko: string | null;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
    description: string | null;
    description_ko: string | null;
    responsibilities: string[];
    technologies: string[];
    logo_url: string | null;
    sort_order: number;
}

export interface Skill {
    id: number;
    category_id: number;
    name: string;
    level: number;
    sort_order: number;
}

export interface SkillCategory {
    id: number;
    name: string;
    name_ko: string | null;
    icon: string | null;
    color: string | null;
    sort_order: number;
    skills: Skill[];
}

export async function getCareers(): Promise<{ careers: Career[] }> {
    return apiFetch('/api/content/careers');
}

export async function getSkills(): Promise<{ categories: SkillCategory[] }> {
    return apiFetch('/api/content/skills');
}

export interface ContactItem {
    id: number;
    key: string;
    value: string;
    label: string | null;
    label_ko: string | null;
    icon: string | null;
}

export async function getContactInfo(): Promise<{ contacts: ContactItem[] }> {
    return apiFetch('/api/content/contact');
}
