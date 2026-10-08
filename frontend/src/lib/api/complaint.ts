import { apiFetch } from '@/lib/api';
import {
  Complaint,
  ComplaintDetail,
  ComplaintResponse,
  CreateComplaintDto,
  ListComplaintsParams,
  ComplaintListResponse,
} from '@/types/complaint';

export async function getComplaints(
  params?: ListComplaintsParams
): Promise<ComplaintListResponse> {
  const res = await apiFetch<{ success: boolean; data: ComplaintListResponse }>('/complaints', {
    method: 'GET',
    params: params as Record<string, string | number | boolean | undefined | null>,
  });
  return res.data;
}

export async function getComplaintById(complaintId: string): Promise<ComplaintDetail> {
  const res = await apiFetch<{ success: boolean; data: ComplaintDetail }>(
    `/complaints/${complaintId}`,
    { method: 'GET' }
  );
  return res.data;
}

export async function createComplaint(dto: CreateComplaintDto): Promise<ComplaintDetail> {
  const res = await apiFetch<{ success: boolean; data: ComplaintDetail }>('/complaints', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  return res.data;
}

export async function uploadComplaintAttachment(file: File): Promise<{
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
  }>('/complaints/upload-attachment', {
    method: 'POST',
    body: formData,
  });

  return res.data;
}

export async function addComplaintResponse(
  complaintId: string,
  message: string
): Promise<ComplaintResponse> {
  const res = await apiFetch<{ success: boolean; data: ComplaintResponse }>(
    `/complaints/${complaintId}/responses`,
    {
      method: 'POST',
      body: JSON.stringify({ message }),
    }
  );
  return res.data;
}
