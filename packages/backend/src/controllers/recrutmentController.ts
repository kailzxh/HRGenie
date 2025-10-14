// backend/src/controllers/recruitmetController.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { supabaseOnboarding as supabase } from '../config/supabase';

import ExcelJS from 'exceljs';
import { Parser as Json2csvParser } from 'json2csv';
import nodemailer from 'nodemailer';

/* ========================= Jobs (existing code) ========================= */
export const getJobs = async (req: Request, res: Response) => {
  try {
    const { department, location, status } = req.query as {
      department?: string;
      location?: string;
      status?: string;
    };

    let query = supabase.from('jobs').select('*');

    if (department) query = query.eq('department', department);
    if (location) query = query.eq('location', location);
    if (status) {
      const isActive = status.toLowerCase() === 'active';
      query = query.eq('is_active', isActive);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      title,
      department,
      location,
      employment_type,
      salary_range = "",
      description = "",
      requirements = {},
      is_active = true,
    } = req.body;

    const { data, error } = await supabase
      .from('jobs')
      .insert([{
        title,
        department,
        location,
        employment_type,
        salary_range,
        description,
        requirements,
        is_active
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Server error', details: error });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Server error', details: error });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Job deleted successfully', data });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Server error', details: error });
  }
};

/* ========================= Applications (new) ========================= */

/**
 * NOTE: this file uses nodemailer for email sending.
 * Configure environment variables:
 *  - SMTP_HOST
 *  - SMTP_PORT
 *  - SMTP_USER
 *  - SMTP_PASS
 *  - MAIL_FROM (optional)
 *
 * Install deps: exceljs json2csv nodemailer
 */

// transporter for sending emails (nodemailer)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

// allowed statuses whitelist
const ALLOWED_STATUS = new Set([
  'submitted',
  'resume_screening',
  'github_analysis',
  'technical_interview',
  'hr_interview',
  'hr_screening',
  'profile_analyzed',
  'offer',
  'rejected',
  'technical_screening'
]);

/**
 * GET /applications
 * Query params supported:
 *  - status (single or comma-separated)
 *  - minScore, maxScore
 *  - q (search full_name or email)
 *  - job_id
 *  - limit, offset (pagination)
 *  - sortBy, sortDir
 */
export const getApplications = async (req: Request, res: Response) => {
  try {
    const {
      status,
      minScore,
      maxScore,
      q,
      job_id,
      limit = '100',
      offset = '0',
      sortBy = 'created_at',
      sortDir = 'desc'
    } = req.query as any;

    console.log('Query params:', req.query);

    // build supabase query selecting all relevant fields
    let query = supabase
      .from('applications')
      .select(`
        id,
        profile_id,
        job_id,
        status,
        resume_url,
        resume_score,
        resume_analysis,
        github_score,
        github_analysis,
        technical_interview_transcript,
        technical_interview_score,
        hr_interview_transcript,
        hr_interview_summary,
        hr_interview_score,
        education,
        experience,
        created_at,
        updated_at,
        full_name,
        phone,
        linkedin_url,
        github_url
      `);

    if (job_id) query = query.eq('job_id', job_id);
    if (status) {
      const statuses = (status as string).split(',').map(s => s.trim()).filter(Boolean);
      if (statuses.length) query = query.in('status', statuses);
    }
    if (minScore) query = query.gte('resume_score', Number(minScore));
    if (maxScore) query = query.lte('resume_score', Number(maxScore));
    if (q) {
      // search by full_name or email (Supabase OR condition)
      query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
    }

    // ordering & pagination
    const sDir = (sortDir && sortDir.toLowerCase() === 'asc') ? 'asc' : 'desc';
    query = query.order(sortBy as string, { ascending: sDir === 'asc' });

    const lim = Math.min(Number(limit) || 100, 1000);
    const off = Math.max(Number(offset) || 0, 0);
    query = query.range(off, off + lim - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log(`Fetched ${data?.length || 0} applications`);

    // explicitly include the scores in each application object (optional, just to be sure)
    const enrichedData = (data || []).map(app => ({
      ...app,
      resume_score: app.resume_score ?? 0,
      github_score: app.github_score ?? 0,
      technical_interview_score: app.technical_interview_score ?? 0,
      hr_interview_score: app.hr_interview_score ?? 0,
    }));

    res.json(enrichedData);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ error: 'Server error', details: err });
  }
};


/**
 * GET /applications/:id
 */
export const getApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // if not found, supabase returns error
      if ((error as any).code === 'PGRST116') return res.status(404).json({ error: 'Not found' });
      throw error;
    }

    res.json(data);
  } catch (err) {
    console.error('Error fetching application:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /applications/:id/status
 * body: { status: string, notify?: boolean (default true), scheduled_date?, scheduled_time?, deadline? }
 *
 * Important: when status is 'hr_interview' or 'technical_interview' we ONLY update status and send notification.
 * Onboarding handles the actual scheduling and later transitions to hr_screening/rejected.
 */
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notify = true, scheduled_date, scheduled_time, deadline } = req.body as any;

    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: 'status is required' });
    }
    if (!ALLOWED_STATUS.has(status)) {
      return res.status(400).json({ error: 'invalid status' });
    }

    // first fetch application to get email & full_name
    const { data: existing, error: fetchErr } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      console.error('Error fetching application before update:', fetchErr);
      return res.status(404).json({ error: 'Application not found' });
    }

    // update status
    const { data, error } = await supabase
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating application status:', error);
      return res.status(500).json({ error: 'Failed to update status' });
    }

    // send notification if requested & email exists
    const candidateEmail = existing.email;
    if (notify && candidateEmail) {
      // craft email
      let subject = 'Update on your application';
      let text = `Hi ${existing.full_name || ''},\n\nYour application status has been updated to: ${status}.\n\n`;

      if (status === 'hr_interview' || status === 'technical_interview') {
        subject = 'Interview scheduled — check your Onboarding portal';
        text = `Hi ${existing.full_name || ''},\n\nGood news — you've been moved to the "${
          status === 'hr_interview' ? 'HR Interview' : 'Technical Interview'
        }" stage.\n\nThe interview has been scheduled in our Onboarding portal. Please log in to the Onboarding system to view the exact time and details and attend as soon as possible.\n\n`;

        if (scheduled_date || scheduled_time) {
          text += `Scheduled: ${scheduled_date ?? ''} ${scheduled_time ?? ''}\n\n`;
        }
        if (deadline) {
          text += `Note: Please attend by ${deadline}. If you do not attend by the deadline, the application may be marked as 'rejected'.\n\n`;
        }

        text += `If you have any questions, reply to this email or contact the recruitment team.\n\nRegards,\nRecruitment Team`;
      } else {
        // generic notification for other statuses
        text += `If you have any questions, reply to this email.\n\nRegards,\nRecruitment Team`;
      }

      // send mail asynchronously (log if error)
      transporter.sendMail({
        from: process.env.MAIL_FROM || 'recruitment@example.com',
        to: candidateEmail,
        subject,
        text
      }).catch((e: any) => console.error('Error sending email notification:', e));
    }

    return res.json(data);
  } catch (err) {
    console.error('Error in updateApplicationStatus:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /applications/bulk-update
 * body: { ids: string[], status: string, notify?: boolean (default true) }
 */
export const bulkUpdateApplications = async (req: Request, res: Response) => {
  try {
    const { ids, status, notify = true } = req.body as any;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }
    if (!status || typeof status !== 'string' || !ALLOWED_STATUS.has(status)) {
      return res.status(400).json({ error: 'valid status is required' });
    }

    // Perform bulk update
    const { data: updatedRows, error } = await supabase
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', ids)
      .select();

    if (error) {
      console.error('Bulk update error:', error);
      return res.status(500).json({ error: 'Bulk update failed' });
    }

    // Notify candidates (best-effort, async)
    if (notify && Array.isArray(updatedRows)) {
      for (const app of updatedRows) {
        if (app.email) {
          // simple message similar to single update
          let subject = 'Update on your application';
          let text = `Hi ${app.full_name || ''},\n\nYour application status has been updated to: ${status}.\n\nRegards,\nRecruitment Team`;

          if (status === 'hr_interview' || status === 'technical_interview') {
            subject = 'Interview scheduled — check your Onboarding portal';
            text = `Hi ${app.full_name || ''},\n\nYou've been moved to the "${
              status === 'hr_interview' ? 'HR Interview' : 'Technical Interview'
            }" stage. Please check the Onboarding portal for scheduling details and attend as soon as possible.\n\nIf you do not attend by the scheduled deadline, your application may be rejected.\n\nRegards,\nRecruitment Team`;
          }

          transporter.sendMail({
            from: process.env.MAIL_FROM || 'recruitment@example.com',
            to: app.email,
            subject,
            text
          }).catch((e: any) => console.error('Bulk email send error:', e));
        }
      }
    }

    return res.json({ updated: Array.isArray(updatedRows) ? updatedRows.length : 0, rows: updatedRows });
  } catch (err) {
    console.error('Error in bulkUpdateApplications:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /applications/export?format=xlsx|csv&status=...&job_id=...
 * Returns a file attachment (xlsx by default)
 */
export const exportApplications = async (req: Request, res: Response) => {
  try {
    const { status, job_id, format = 'xlsx' } = req.query as any;

    // build supabase query
    let query = supabase.from('applications').select('*');

    if (job_id) query = query.eq('job_id', job_id);
    if (status) {
      const statuses = (status as string).split(',').map((s: string) => s.trim()).filter(Boolean);
      if (statuses.length) query = query.in('status', statuses);
    }

    // fetch all matching (no pagination to export everything)
    const { data: rows, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.error('Export fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch data for export' });
    }

    // CSV export
    if ((format as string).toLowerCase() === 'csv') {
      const fields = ['id','full_name','email','phone','status','resume_score','github_score','created_at','job_id','linkedin_url','github_url'];
      const json2csv = new Json2csvParser({ fields });
      const csv = json2csv.parse(rows || []);
      res.header('Content-Type', 'text/csv');
      res.attachment('applications_export.csv');
      return res.send(csv);
    }

    // Excel export (xlsx) using exceljs
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Applications');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Full Name', key: 'full_name', width: 24 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Phone', key: 'phone', width: 16 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Resume Score', key: 'resume_score', width: 14 },
      { header: 'GitHub Score', key: 'github_score', width: 14 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Job ID', key: 'job_id', width: 36 },
      { header: 'LinkedIn URL', key: 'linkedin_url', width: 40 },
      { header: 'GitHub URL', key: 'github_url', width: 40 }
    ];

    sheet.getRow(1).font = { bold: true };

    (rows || []).forEach((r: any) => {
      sheet.addRow({
        id: r.id,
        full_name: r.full_name ?? '',
        email: r.email ?? '',
        phone: r.phone ?? '',
        status: r.status ?? '',
        resume_score: r.resume_score ?? '',
        github_score: r.github_score ?? '',
        created_at: r.created_at ? new Date(r.created_at).toISOString() : '',
        job_id: r.job_id ?? '',
        linkedin_url: r.linkedin_url ?? '',
        github_url: r.github_url ?? ''
      });
    });

    // format created_at column
    const createdAtCol = sheet.getColumn('created_at');
    createdAtCol.numFmt = 'yyyy-mm-dd hh:mm:ss';

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=applications_export.xlsx');
    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Error exporting applications:', err);
    return res.status(500).json({ error: 'Export failed' });
  }
};
