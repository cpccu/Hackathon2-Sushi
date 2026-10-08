import { apiFetch } from '@/lib/api';
import {
  LostFoundPost,
  CreateLostFoundDto,
  UpdateLostFoundDto,
  ListLostFoundParams,
  LostFoundListResponse,
} from '@/types/lostFound';

export async function getLostFoundPosts(params?: ListLostFoundParams): Promise<LostFoundListResponse> {
  const res = await apiFetch<{ success: boolean; data: LostFoundListResponse }>('/lost-found', {
    method: 'GET',
    params: params as Record<string, string | number | boolean | undefined | null>,
  });
  return res.data;
}

export async function getMyLostFoundPosts(): Promise<LostFoundPost[]> {
  const res = await apiFetch<{ success: boolean; data: LostFoundPost[] }>('/lost-found/my', {
    method: 'GET',
  });
  return res.data;
}

export async function getLostFoundPostById(postId: string): Promise<LostFoundPost> {
  const res = await apiFetch<{ success: boolean; data: LostFoundPost }>(`/lost-found/${postId}`, {
    method: 'GET',
  });
  return res.data;
}

export async function uploadLostFoundImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await apiFetch<{
    success: boolean;
    data: { image_url: string };
  }>('/lost-found/upload-image', {
    method: 'POST',
    body: formData,
  });

  return res.data.image_url;
}

export async function uploadLostFoundImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const res = await apiFetch<{
    success: boolean;
    data: { image_urls: string[] };
  }>('/lost-found/upload-images', {
    method: 'POST',
    body: formData,
  });

  return res.data.image_urls;
}

export async function createLostFoundPost(
  dto: CreateLostFoundDto
): Promise<{ id: string; item_name: string; created_at: string }> {
  const res = await apiFetch<{
    success: boolean;
    data: { id: string; item_name: string; created_at: string };
  }>('/lost-found', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  return res.data;
}

export async function updateLostFoundPost(
  postId: string,
  dto: UpdateLostFoundDto
): Promise<LostFoundPost> {
  const res = await apiFetch<{ success: boolean; data: LostFoundPost }>(`/lost-found/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
  return res.data;
}

export async function resolveLostFoundPost(
  postId: string
): Promise<{ id: string; status: 'resolved' }> {
  const res = await apiFetch<{
    success: boolean;
    data: { id: string; status: 'resolved' };
  }>(`/lost-found/${postId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'resolved' }),
  });
  return res.data;
}
