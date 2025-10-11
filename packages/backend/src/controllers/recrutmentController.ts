// backend/src/controllers/recruitmentController.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
// CHANGE: Import the new admin client for the 'onboarding' schema and alias it as 'supabase'
import { supabaseOnboarding as supabase } from '../config/supabase';

// ========================= Jobs =========================
export const getJobs = async (req: Request, res: Response) => {
  try {
    const { department, location, status } = req.query as {
      department?: string;
      location?: string;
      status?: string;
    };

    // FIX: Removed the second argument from .from()
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
    // FIX: Removed the second argument from .from()
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

    const { title, department, location, employment_type, salary_range, is_active = true } = req.body;

    // FIX: Removed the second argument from .from()
    const { data, error } = await supabase
      .from('jobs')
      .insert([{ title, department, location, employment_type, salary_range, is_active }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // FIX: Removed the second argument from .from()
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
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // FIX: Removed the second argument from .from()
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
    res.status(500).json({ error: 'Server error' });
  }
};