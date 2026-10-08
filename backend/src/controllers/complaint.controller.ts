import { Request, Response, NextFunction } from 'express';
import * as complaintService from '../services/complaint.service.js';
import { uploadDocumentToCloudinary } from '../services/upload.service.js';
import {
  createComplaintSchema,
  addResponseSchema,
  listComplaintsQuerySchema,
} from '../schemas/complaint.schema.js';
import { UnauthorizedError } from '../utils/errors.js';

// GET /api/v1/complaints
export async function listComplaints(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validated = await listComplaintsQuerySchema.parseAsync(req.query);
    const callerId = req.user?.id ?? null;
    const data = await complaintService.getComplaints(validated, callerId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/complaints/:complaintId
export async function getComplaint(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { complaintId } = req.params;
    const callerId = req.user?.id ?? null;
    const data = await complaintService.getComplaintById(complaintId, callerId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/complaints  (student — identity NOT saved)
export async function createComplaint(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const validated = await createComplaintSchema.parseAsync(req.body);
    // Note: req.user.id is intentionally NOT passed to the service — anonymous
    const data = await complaintService.createComplaint(validated);
    res.status(201).json({
      success: true,
      message: 'Complaint submitted anonymously',
      data,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/complaints/upload-attachment  (student)
export async function uploadAttachment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const originalName = req.file.originalname;
    const ext = originalName.split('.').pop()?.toLowerCase() || '';
    const size = req.file.size;

    const { file_url, file_type } = await uploadDocumentToCloudinary(
      req.file.buffer,
      originalName,
      'campus_complaints'
    );

    res.status(200).json({
      success: true,
      message: 'Attachment uploaded successfully',
      data: {
        file_url,
        file_type: file_type || ext,
        title: originalName,
        file_size: size,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/complaints/:complaintId/responses  (helpdesk_admin only)
export async function addResponse(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const { complaintId } = req.params;
    const validated = await addResponseSchema.parseAsync(req.body);
    const data = await complaintService.addComplaintResponse(complaintId, req.user.id, validated);
    res.status(201).json({
      success: true,
      message: 'Response added successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
}
