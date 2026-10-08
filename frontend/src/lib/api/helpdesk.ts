import { apiFetch } from '@/lib/api';
import {
  HelpdeskPost,
  CreateHelpdeskPostDto,
  UpdateHelpdeskPostDto,
  ListHelpdeskParams,
  HelpdeskListResponse,
} from '@/types/helpdesk';

export async function getHelpdeskPosts(params?: ListHelpdeskParams): Promise<HelpdeskListResponse> {
  const res = await apiFetch<{ success: boolean; data: HelpdeskListResponse }>('/helpdesk', {
    method: 'GET',
    params: params as Record<string, string | number | boolean | undefined | null>,
  });
  return res.data;
}

export async function getHelpdeskPostById(postId: string): Promise<HelpdeskPost> {
  const res = await apiFetch<{ success: boolean; data: HelpdeskPost }>(`/helpdesk/${postId}`, {
    method: 'GET',
  });
  return res.data;
}

export async function createHelpdeskPost(dto: CreateHelpdeskPostDto): Promise<HelpdeskPost> {
  const res = await apiFetch<{ success: boolean; data: HelpdeskPost }>('/helpdesk', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  return res.data;
}

export async function updateHelpdeskPost(
  postId: string,
  dto: UpdateHelpdeskPostDto
): Promise<HelpdeskPost> {
  const res = await apiFetch<{ success: boolean; data: HelpdeskPost }>(`/helpdesk/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
  return res.data;
}

export async function deleteHelpdeskPost(postId: string): Promise<void> {
  await apiFetch(`/helpdesk/${postId}`, {
    method: 'DELETE',
  });
}

export async function uploadHelpdeskAttachment(file: File): Promise<{
  file_url: string;
  file_type: string;
  title: string;
  file_size: number;
}> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await apiFetch<{
    success: boolean;
    data: {
      file_url: string;
      file_type: string;
      title: string;
      file_size: number;
    };
  }>('/helpdesk/upload-attachment', {
    method: 'POST',
    body: formData,
  });

  return res.data;
}
