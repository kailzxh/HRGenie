'use client'
export const dynamic = 'force-dynamic';
import { useState, useEffect, FC, FormEvent, ReactNode, ChangeEvent, MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, TrendingUp, Award, Users, MessageCircle, FileText, Star, PieChart, 
  Settings, BookOpen, AlertTriangle, ThumbsUp, MessageSquare, X, Edit, PlusCircle, 
  Zap, Calendar, GitCommit
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { toast } from 'sonner'; 

// =================================================================
// --- CONSTANTS & API HELPERS ---
// =================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


async function apiRequest(endpoint: string, method: string, token: string | null, body?: any) {
  if (!token) throw new Error("Authentication token not found.");
  const response = await fetch(`${API_BASE_URL}/performance${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `API request failed: ${response.statusText}`);
  }
  return response.status === 204 ? null : response.json();
}

async function apiAdminRequest(endpoint: string, method: string, token: string | null, body?: any) {
  if (!token) throw new Error("Authentication token not found.");
  
  const response = await fetch(`${API_BASE_URL}/performance${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      message: `Server returned non-JSON error for ${endpoint}. Status: ${response.status}` 
    }));
    throw new Error(errorData.message || `API request failed: ${response.statusText}`);
  }
  return response.status === 204 ? null : response.json();
}
interface ManualAlertData {
    review_id: string;
    detected_bias_type: string;
    details: string;
}
// =================================================================
// --- REUSABLE COMPONENTS ---
// =================================================================

const ChartWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  return (
    <div style={{ width: '100%', height: '400px' }}>
      {isMounted && children}
    </div>
  );
};

const Modal: FC<{ children: ReactNode, onClose: () => void }> = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={(e: MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }}>
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className="card p-6 rounded-xl shadow-lg relative bg-white dark:bg-gray-800 w-full max-w-lg" 
      onClick={e => e.stopPropagation()}
    >
      {children}
    </motion.div>
  </div>
);

const FormInput: FC<any> = ({ className = '', ...props }) => (
  <input 
    className={`input w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 rounded-lg p-2.5 shadow-sm ${className}`} 
    {...props} 
  />
);

const FormTextarea: FC<any> = ({ className = '', ...props }) => (
  <textarea 
    className={`input w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 rounded-lg p-2.5 shadow-sm ${className}`} 
    {...props} 
  />
);

const FormSelect: FC<any> = ({ className = '', children, ...props }) => (
  <select 
    className={`input w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 rounded-lg p-2.5 shadow-sm ${className}`} 
    {...props}
  >
    {children}
  </select>
);

const StatCard: FC<any> = ({ icon: Icon, color, label, value }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
    <div className="flex items-center">
      <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900/20 rounded-lg flex items-center justify-center`}>
        <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value || 'N/A'}</p>
      </div>
    </div>
  </motion.div>
);

const PlaceholderContent: FC<{ title: string }> = ({ title }) => (
  <div className="card p-6 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-center">
    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400">This feature is under development.</p>
  </div>
);

const CustomTooltip: FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-md text-sm">
        <p className="font-medium text-gray-900 dark:text-white">{payload[0].payload.employeeName}</p>
        <p className="text-gray-700 dark:text-gray-300">Score: {payload[0].value}/10</p>
        <p className="text-gray-700 dark:text-gray-300">Goals Met: {payload[1].value}%</p>
      </div>
    );
  }
  return null;
};

// =================================================================
// --- FORM MODALS ---
// =================================================================

const GoalFormModal: FC<{ goal?: any, teamMembers?: any[], onClose: () => void, onSubmit: (data: any) => Promise<void> }> = ({ goal, teamMembers, onClose, onSubmit }) => {
  const isUpdating = !!goal;
  const [formData, setFormData] = useState({ 
    employee_id: goal?.employee_id || (teamMembers && teamMembers.length > 0 ? teamMembers[0].id : ''),
    title: goal?.title || '', 
    description: goal?.description || '', 
    target_metric: goal?.target_metric || '', 
    due_date: goal?.due_date ? new Date(goal.due_date).toISOString().split('T')[0] : '',
    progress: goal?.progress || 0,
    status: goal?.status || 'on_track'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success(`Goal ${isUpdating ? 'updated' : 'created'} successfully!`);
      onClose();
    } catch (error: any) {
      toast.error(`Failed to ${isUpdating ? 'update' : 'create'} goal: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20}/></button>
      <h3 className="text-lg font-semibold mb-5 text-gray-900 dark:text-white">{isUpdating ? 'Update Goal' : 'Set New Goal'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {teamMembers && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">For Employee</label>
            <FormSelect value={formData.employee_id} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({...formData, employee_id: e.target.value})}>
              {teamMembers.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
            </FormSelect>
          </div>
        )}
        <FormInput type="text" placeholder="Goal Title*" required value={formData.title} onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, title: e.target.value})} />
        <FormTextarea placeholder="Description" value={formData.description} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, description: e.target.value})} rows={3}/>
        <FormInput type="date" required value={formData.due_date} onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, due_date: e.target.value})} />
        {isUpdating && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Progress ({formData.progress}%)</label>
              <input type="range" min="0" max="100" step="5" value={formData.progress} onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, progress: parseInt(e.target.value)})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
              <FormSelect value={formData.status} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({...formData, status: e.target.value})}>
                <option value="on_track">On Track</option>
                <option value="at_risk">At Risk</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </FormSelect>
            </div>
          </>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Saving...' : 'Save Goal'}</button>
        </div>
      </form>
    </Modal>
  );
};

const ReviewFormModal: FC<{ review: any, employeeName: string, onClose: () => void, onFinalize: (reviewId: string, data: any) => Promise<void> }> = ({ review, employeeName, onClose, onFinalize }) => {
  const [formData, setFormData] = useState({ overall_rating: review.overall_rating || '', summary: review.summary || '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onFinalize(review.id, formData);
      toast.success("Review finalized successfully!");
      onClose();
    } catch (error: any) {
      toast.error(`Failed to finalize review: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal onClose={onClose}>
      <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20}/></button>
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Finalize Review</h3>
      <p className="text-gray-500 mb-5">For: <span className="font-medium text-gray-800 dark:text-gray-200">{employeeName}</span></p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Overall Rating (0-10)</label>
          <FormInput type="number" step="0.1" min="0" max="10" required value={formData.overall_rating} onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, overall_rating: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Manager's Summary*</label>
          <FormTextarea placeholder="Provide a summary of the performance..." required value={formData.summary} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, summary: e.target.value})} rows={5}/>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Finalizing...' : 'Finalize Review'}</button>
        </div>
      </form>
    </Modal>
  );
};

const FeedbackFormModal: FC<{ teamMembers?: any[], onClose: () => void, onSubmit: (data: any) => Promise<void> }> = ({ teamMembers, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ 
    recipient_id: teamMembers && teamMembers.length > 0 ? teamMembers[0].id : '',
    content: '', 
    type: 'praise', 
    is_anonymous: false 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success(`Feedback submitted successfully!`);
      onClose();
    } catch (error: any) {
      toast.error(`Failed to submit feedback: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20}/></button>
      <h3 className="text-lg font-semibold mb-5 text-gray-900 dark:text-white">Give Feedback</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {teamMembers && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">To Employee*</label>
            <FormSelect required value={formData.recipient_id} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({...formData, recipient_id: e.target.value})}>
              {teamMembers.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
            </FormSelect>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Feedback Type</label>
          <FormSelect value={formData.type} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({...formData, type: e.target.value})}>
            <option value="praise">Praise / Recognition</option>
            <option value="constructive">Constructive</option>
          </FormSelect>
        </div>
        <FormTextarea placeholder="Feedback Content*" required value={formData.content} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, content: e.target.value})} rows={4}/>
        <div className="flex items-center space-x-2">
          <input id="anonymous" type="checkbox" checked={formData.is_anonymous} onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, is_anonymous: e.target.checked})} className="rounded text-primary-600 focus:ring-primary-500"/>
          <label htmlFor="anonymous" className="text-sm font-medium text-gray-700 dark:text-gray-300">Send Anonymously</label>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</button>
        </div>
      </form>
    </Modal>
  );
};

const BiasMitigationForm: FC<{ onClose: () => void, alertData?: any }> = ({ onClose, alertData }) => {
  const [formData, setFormData] = useState({
       
        review_id: alertData?.review_id || '', 
        type: alertData?.detected_bias_type || 'recency_bias',  
        context: alertData?.details || '', 
        action_taken: '',
    });
  const [isSubmitting, setIsSubmitting] = useState(false);

 const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.action_taken) {
        toast.error("Mitigation Action is required.");
        return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('supabase-auth-token');
    

    const payload = {
        bias_type: formData.type,              
        action_taken: formData.action_taken,
        review_id: formData.review_id || null,
    };

    try {
        
        await apiAdminRequest('/admin/bias-log', 'POST', token, payload); 
        toast.success("Bias mitigation action logged successfully.");
       
        onClose();
    } catch (error: any) {
        toast.error(`Failed to log action: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
};
  return (
    <Modal onClose={onClose}>
      <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20}/></button>
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Address Bias Alert</h3>
      
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        <form id="bias-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Review ID (UUID - Optional)</label>
            <FormInput 
              type="text" 
              placeholder="UUID of the affected review (Optional)" 
              value={formData.review_id} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, review_id: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Bias Type Detected</label>
            <FormSelect value={formData.type} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({...formData, type: e.target.value})}>
              <option value="recency_bias">Recency Bias</option>
              <option value="similarity_bias">Similarity Bias</option>
              <option value="central_tendency">Central Tendency</option>
              <option value="other">Other</option>
            </FormSelect>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Context / Alert Details (Optional)</label>
            <FormTextarea value={formData.context} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, context: e.target.value})} rows={3} placeholder="E.g., Reviews for Sales Team Q4 2025"/>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Mitigation Action Taken*</label>
            <FormTextarea required value={formData.action_taken} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, action_taken: e.target.value})} rows={5} placeholder="Describe the action taken to mitigate the bias..."/>
          </div>
          
        </form>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" form="bias-form" disabled={isSubmitting} className="btn-primary flex items-center gap-1.5">
          {isSubmitting ? 'Logging...' : <><Zap size={16}/> Log Action</>}
        </button>
      </div>
    </Modal>
  );
};

const ManualAlertFormModal: FC<{ 
    onClose: () => void, 
    onSubmit: (data: any) => Promise<void>,
    // ADDED PROP: Function to call on success (triggers data refresh in parent)
    onSuccess: () => void 
}> = ({ onClose, onSubmit, onSuccess }) => { 
    
    const [formData, setFormData] = useState({
        review_id: '',
        detected_bias_type: 'similarity_bias',
        details: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!formData.review_id || !formData.detected_bias_type) {
            toast.error("Review ID and Bias Type are required.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Await the API submission passed from the parent handler (e.g., handleManualAlertSubmit)
            await onSubmit(formData); 
            
            toast.success("Bias Alert created successfully!");
            
            // CRITICAL FIX: Call onSuccess instead of onClose()
            // The onSuccess prop handles calling fetchData() AND closing the modal.
            onSuccess(); 
        } catch (error: any) {
            toast.error(`Failed to create alert: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal onClose={onClose}>
            <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">{/* <X size={20}/> */}</button>
            <h3 className="text-lg font-semibold mb-5 text-gray-900 dark:text-white">Manually Create Bias Alert</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Target Review ID (UUID)*</label>
                    <FormInput 
                        type="text" 
                        required 
                        placeholder="UUID of the specific review" 
                        value={formData.review_id} 
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, review_id: e.target.value})} 
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Detected Bias Type*</label>
                    <FormSelect 
                        required
                        value={formData.detected_bias_type} 
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({...formData, detected_bias_type: e.target.value})}
                    >
                        <option value="similarity_bias">Similarity Bias</option>
                        <option value="leniency_bias">Leniency/Strictness Bias</option>
                        <option value="recency_bias">Recency Bias</option>
                        <option value="halo_effect">Halo/Horns Effect</option>
                        <option value="other">Other</option>
                    </FormSelect>
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Alert Details / Context (Optional)</label>
                    <FormTextarea 
                        value={formData.details} 
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, details: e.target.value})} 
                        rows={3} 
                        placeholder="Describe why this alert is being created."
                    />
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-1.5">
                        {isSubmitting ? 'Creating...' : 'Create Alert'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const ReviewCycleFormModal: FC<{ cycle?: any, onClose: () => void, onSubmit: (data: any) => Promise<void> }> = ({ cycle, onClose, onSubmit }) => {
  const isUpdating = !!cycle;
  const [formData, setFormData] = useState({
    name: cycle?.name || `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()} Review`,
    start_date: cycle?.start_date ? new Date(cycle.start_date).toISOString().split('T')[0] : '',
    end_date: cycle?.end_date ? new Date(cycle.end_date).toISOString().split('T')[0] : '',
    status: cycle?.status || 'draft',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success(`Review Cycle ${isUpdating ? 'updated' : 'created'} successfully!`);
      onClose();
    } catch (error: any) {
      toast.error(`Failed to ${isUpdating ? 'update' : 'create'} cycle: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20}/></button>
      <h3 className="text-lg font-semibold mb-5 text-gray-900 dark:text-white">{isUpdating ? 'Update Review Cycle' : 'Create New Review Cycle'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput type="text" placeholder="Cycle Name (e.g., Q4 2025 Review)" required value={formData.name} onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}/>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Start Date*</label>
            <FormInput type="date" required value={formData.start_date} onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, start_date: e.target.value})}/>
          </div>
          <div className='flex-1'>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">End Date*</label>
            <FormInput type="date" required value={formData.end_date} onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, end_date: e.target.value})}/>
          </div>
        </div>
        {isUpdating && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
            <FormSelect value={formData.status} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({...formData, status: e.target.value})}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </FormSelect>
          </div>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-1.5">{isSubmitting ? 'Saving...' : <><Calendar size={16}/> Save Cycle</>}</button>
        </div>
      </form>
    </Modal>
  );
};

// =================================================================
// --- WIDGET COMPONENTS ---
// =================================================================

const GoalsWidget: FC<{ goals?: any[], isManager?: boolean, onUpdateGoal: (goal: any | null) => void, teamMembers?: any[] }> = ({ goals, isManager, onUpdateGoal, teamMembers }) => (
  <div className="card p-6 rounded-xl shadow-sm bg-white dark:bg-gray-800">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isManager ? 'Team Goals Overview' : 'My Goals'}</h3>
      <button onClick={() => onUpdateGoal(null)} className="btn-primary-sm flex items-center gap-1.5"><PlusCircle size={14}/> {isManager ? 'Set Team Goal' : 'Set New Goal'}</button>
    </div>
    {goals && goals.length > 0 ? (
      <ul className="space-y-4">
        {goals.map((goal: any) => (
          <li key={goal.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg group">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium text-gray-800 dark:text-gray-200">{goal.title}</span>
                {isManager && <span className="text-xs text-gray-500 ml-2">({teamMembers?.find(t => t.id === goal.employee_id)?.name})</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{goal.progress || 0}%</span>
                <button onClick={() => onUpdateGoal(goal)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><Edit size={14} className="text-gray-500" /></button>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2"><motion.div className="bg-primary-600 h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${goal.progress || 0}%` }}/></div>
          </li>
        ))}
      </ul>
    ) : <p className="text-gray-500 dark:text-gray-400">No goals found for this period.</p>}
  </div>
);

const ReviewsWidget: FC<{ reviews?: any[], isManager?: boolean, team?: any[], onFinalizeReview: (review: any) => void }> = ({ reviews, isManager, team, onFinalizeReview }) => (
  <div className="card p-6 rounded-xl shadow-sm bg-white dark:bg-gray-800">
    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{isManager ? 'Team Reviews' : 'My Reviews'}</h3>
    {reviews && reviews.length > 0 ? (<div className="space-y-4">{reviews.map((review: any) => (
      <div key={review.id || review.employee_id} className="p-4 border dark:border-gray-700 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-800 dark:text-gray-200">{isManager ? team?.find(t => t.id === review.employee_id)?.name : 'Q4 2025 Review'}</span>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${review.status === 'finalized' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{review.status.replace('_', ' ')}</span>
        </div>
        <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">Overall Rating: <span className="font-bold">{review.overall_rating || 'N/A'} / 10</span></p>
        {isManager && review.status !== 'finalized' && <button onClick={() => onFinalizeReview(review)} className="btn-secondary-sm mt-3">Write / Finalize Review</button>}
      </div>
    ))}</div>) : <p className="text-gray-500 dark:text-gray-400">No reviews found.</p>}
  </div>
);

const FeedbackWidget: FC<{ feedback?: any[] }> = ({ feedback }) => ( 
  <div className="card p-6 rounded-xl shadow-sm bg-white dark:bg-gray-800">
    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Feedback Received</h3>
    {feedback && feedback.length > 0 ? (
      <ul className="space-y-4">
        {feedback.map((item: any) => (
          <li key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-start">
              <div className={`mr-3 mt-1 ${item.type === 'praise' ? 'text-green-500' : 'text-yellow-500'}`}>
                {item.type === 'praise' ? <ThumbsUp size={18} /> : <MessageSquare size={18} />}
              </div>
              <div>
                <p className="text-sm text-gray-800 dark:text-gray-200">{item.content}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">- {item.is_anonymous ? 'Anonymous' : item.giver?.name || 'Unknown'} on {new Date(item.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    ) : <p className="text-gray-500 dark:text-gray-400">No feedback received yet.</p>}
  </div>
);

const SkillsRadarChart: FC<{ skills?: any[] }> = ({ skills }) => { 
  const data = skills?.map((skill: any) => ({ 
    subject: skill.skills?.name || 'Unknown', 
    A: skill.proficiency_level, 
    fullMark: 5 
  })) || []; 
  
  return ( 
    <div className="card p-6 rounded-xl shadow-sm bg-white dark:bg-gray-800">
      {/* <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Skills Profile</h3> */}
      {data.length > 0 ? (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="subject" stroke="#6B7280" />
              <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#6B7280" />
              <Radar name="Proficiency" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="text-gray-500 dark:text-gray-400">No skills data available. Please assess your skills.</p>}
    </div>
  );
};

const TeamOverview: FC<{ team?: any[], onGiveFeedback: () => void }> = ({ team, onGiveFeedback }) => ( 
  <div className="card p-6 rounded-xl shadow-sm bg-white dark:bg-gray-800">
    <div className='flex justify-between items-center mb-4'>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Overview</h3>
      <button onClick={onGiveFeedback} className="btn-primary-sm flex items-center gap-1.5"><MessageSquare size={14}/> Give Feedback</button>
    </div>
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b dark:border-gray-700">
          <th className="py-2 text-gray-600 dark:text-gray-400">Employee</th>
          <th className="py-2 text-gray-600 dark:text-gray-400">Position</th>
          <th className="py-2 text-center text-gray-600 dark:text-gray-400">Last Score</th>
          <th className="py-2 text-center text-gray-600 dark:text-gray-400">Goals Met</th>
        </tr>
      </thead>
      <tbody>
        {team?.map((member: any) => (
          <tr key={member.id} className="border-b dark:border-gray-700">
            <td className="py-3 font-medium text-gray-800 dark:text-gray-200">{member.name}</td>
            <td className="py-3 text-gray-500 dark:text-gray-400">{member.position}</td>
            <td className="py-3 text-center font-semibold text-gray-800 dark:text-gray-200">{member.lastScore || 'N/A'}/10</td>
            <td className="py-3 text-center font-semibold text-gray-800 dark:text-gray-200">{member.goalsMetPercent || 'N/A'}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PerformanceCalibrationChart: FC<{ data?: any[] }> = ({ data }) => { 
  const chartData = data || [];
  
  return ( 
    <div className="card p-6 rounded-xl shadow-sm bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Performance vs Goals Calibration (Q4)
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Identify misalignments: Employees with high scores but low goal completion, or vice versa.
      </p>

      {chartData.length > 0 ? (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis
                type="number"
                dataKey="score"
                name="Performance Score"
                unit="/10"
                domain={[0, 10]}
                stroke="#6B7280"
              />
              <YAxis
                type="number"
                dataKey="goalsMetPercent"
                name="Goals Met"
                unit="%"
                domain={[0, 100]}
                stroke="#6B7280"
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Legend />
              <Scatter name="Employees" data={chartData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 w-full flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">No calibration data available.</p>
        </div>
      )}
    </div>
  );
};
const BiasDetectionAlertWidget: FC<{ alerts?: any[], onAddressBias: (alert: any) => void, onManualCreate: () => void }> = ({ alerts, onAddressBias, onManualCreate }) => {
    const alertCount = alerts?.length || 0;
    const currentAlert = alerts?.[0]; // Focuses on the single, most recent alert
    const defaultMessage = "No new bias alerts detected. All systems nominal.";
    
    // Extract the reviewee name from the nested structure (review.employee.name)
    const revieweeName = currentAlert?.review?.employee?.name;
    
    // Construct a clear message for the Admin
    const alertMessageDetail = revieweeName
        ? `Reviewee: ${revieweeName}. Details: ${currentAlert.details}`
        : currentAlert?.details || `Review ID ${currentAlert?.review_id || 'N/A'}`;

    const biasType = currentAlert?.detected_bias_type || "Potential Bias";

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button onClick={onManualCreate} className="btn-primary-sm flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Log New Alert
                </button>
            </div>

            <div className="card p-6 rounded-xl shadow-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                <div className='flex justify-between items-start'>
                    <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <AlertTriangle size={20}/> Bias Alerts ({alertCount})
                        </h3>
                        {alertCount > 0 ? (
                            <>
                                <p className="font-medium mt-2">
                                    **{biasType.replace(/_/g, ' ').toUpperCase()}** detected.
                                </p>
                                <p className="text-sm mt-1">
                                    {alertMessageDetail}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm mt-2">{defaultMessage}</p>
                        )}
                    </div>
                    
                    {alertCount > 0 && (
                        <button 
                            onClick={() => onAddressBias(currentAlert)} 
                            className="btn-secondary-sm flex items-center gap-1.5 ml-4"
                        >
                            <Zap size={14}/> Log Action
                        </button>
                    )}
                </div>
            </div>
            
            {/* NEW: Optional section to list all pending alerts */}
            {alertCount > 1 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-medium mb-1">Total pending alerts: {alertCount}</p>
                    {alerts?.slice(1).map(alert => (
                        <p key={alert.id} className="truncate hover:underline cursor-pointer" onClick={() => onAddressBias(alert)}>
                            - {alert.detected_bias_type.replace(/_/g, ' ')} on {alert.review?.employee?.name || 'Reviewee N/A'}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};
    const ReviewTasksWidget: FC<{ tasks?: any[], onStartReview: (participantId: string) => void }> = ({ tasks, onStartReview }) => (
  <div className="card p-6 rounded-xl shadow-sm bg-white dark:bg-gray-800">
    <h3 className="text-lg font-semibold mb-4 text-orange-600 dark:text-orange-400">
      Pending Review Tasks
    </h3>
    {tasks && tasks.length > 0 ? (
      <div className="space-y-4">
        {tasks.map((task: any) => (
          <div key={task.participantId} className="p-4 border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-gray-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {task.reviewRole === 'self' 
                  ? 'Self Review' 
                  : `Review for ${task.revieweeName} (${task.reviewRole})`}
              </span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize bg-yellow-100 text-yellow-800`}>
                Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <button 
              onClick={() => onStartReview(task.participantId)} 
              className="btn-primary-sm mt-3 bg-orange-500 hover:bg-orange-600"
            >
              Start Review
            </button>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 dark:text-gray-400">No pending review tasks.</p>
    )}
  </div>
    );


const AdminReviewCyclesWidget: FC<{ cycles?: any[], onAddCycle: () => void }> = ({ cycles, onAddCycle }) => ( 
  <div className="card p-6 rounded-xl shadow-sm bg-white dark:bg-gray-800">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review Cycles</h3>
      <button onClick={onAddCycle} className="btn-primary-sm flex items-center gap-1.5"><Calendar size={14}/> New Cycle</button>
    </div>
    {cycles && cycles.length > 0 ? (
      <ul className="space-y-3">
        {cycles.map((cycle: any) => (
          <li key={cycle.id} className="p-3 border dark:border-gray-700 rounded-lg flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">{cycle.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()}</p>
            </div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${cycle.status === 'active' ? 'bg-green-100 text-green-800' : cycle.status === 'draft' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{cycle.status}</span>
          </li>
        ))}
      </ul>
    ) : <p className="text-gray-500 dark:text-gray-400">No review cycles configured.</p>}
  </div>
);

// =================================================================
// --- MAIN PAGE COMPONENT ---
// =================================================================

export default function PerformancePage() {
  const [view, setView] = useState<'employee' | 'manager' | 'admin'>('employee');
  const [activeTab, setActiveTab] = useState('goals');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [managerData, setManagerData] = useState<any>(null);
  const [adminData, setAdminData] = useState<any>(null);
  const [employeeTasks, setEmployeeTasks] = useState<any[]>([]);
  const [showManualAlertModal, setShowManualAlertModal] = useState(false);
  
  // Modal States
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalToUpdate, setGoalToUpdate] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewToFinalize, setReviewToFinalize] = useState<any>(null);
  const [showBiasFormModal, setShowBiasFormModal] = useState(false);
  const [showCycleFormModal, setShowCycleFormModal] = useState(false);
  const [cycleToUpdate, setCycleToUpdate] = useState<any>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [alertToAddress, setAlertToAddress] = useState<any>(null);

const fetchCalibrationData = async () => {
    const token = localStorage.getItem('supabase-auth-token');
    if (!token) return;

    try {
        // Hitting the controller that executes getPerformanceCalibrationData
        const res = await apiRequest('/calibration', 'GET', token); 
        // Assuming your dashboard state is managed via adminData, update it specifically
        setAdminData((prevData: any) => ({
            ...prevData,
            calibrationData: res.data || [] // Assuming the response format is { data: [...] }
        }));
    } catch (err) {
        console.error("Failed to load calibration data:", err);
    }
};



 const fetchData = async () => {
  if (!userRole) return;
  setIsLoading(true); setError(null);
  const token = localStorage.getItem('supabase-auth-token'); 
  if (!token) { setError("Token not found."); setIsLoading(false); return; }
  
  try {
    const mainDataUrl = view === 'admin' ? '/admin-view' : `/${view}-view`;
    const res = await apiRequest(mainDataUrl, 'GET', token);
    
    if (view === 'employee') {
      setEmployeeData(res);
      try {
         const tasks = await apiRequest('/pending-review-tasks', 'GET', token);
            setEmployeeTasks(tasks);
             } catch (taskErr) {
                console.error("Failed to fetch pending review tasks:", taskErr);
                setEmployeeTasks([]); 
             }
            } 
         else if (view === 'manager') {
            setManagerData(res); // Includes managerReviewTasks from backend
            }
             else if (view === 'admin') {
            setAdminData(res);
             }

        } catch (err: any) { 
                setError(err.message);
        } finally { 
                setIsLoading(false); 
        }
    };

    // --- NEW useEffect BLOCK TO ADD ---
useEffect(() => {
    // Only fetch calibration data when the admin user selects the 'calibration' tab
    if (view === 'admin' && activeTab === 'calibration') {
        fetchCalibrationData();
    }
}, [view, activeTab]); // Triggers when the active tab changes
  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem('supabase-auth-token');

      if (!token) { setUserRole('employee'); setView('employee'); setActiveTab('goals'); return; }
      try {
        const userData = await apiRequest('/../auth/user', 'GET', token);
        const role = userData.role === 'hr' ? 'admin' : userData.role || 'employee';
        setUserRole(role); setView(role);
        if (role === 'employee') setActiveTab('goals'); else if (role === 'manager') setActiveTab('team'); else if (role === 'admin') setActiveTab('overview');
      } catch (err) { setUserRole('employee'); setView('employee'); setActiveTab('goals'); }
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    fetchData();
  }, [view, userRole]);

  // Action Handlers
  const handleStartReview = (participantId: string) => {
  // Navigate to review form with participantId
    console.log(`Starting review for participant: ${participantId}`);
  // Example: router.push(`/review/form/${participantId}`);
    };

 // MODIFIED handleManualAlertSubmit: Simply performs the network call.
const handleManualAlertSubmit = async (formData: ManualAlertData) => {
    const token = localStorage.getItem('supabase-auth-token');
    await apiRequest('/admin/alerts', 'POST', token, formData);
    await fetchData();
};

  const handleGoalSubmit = async (formData: any) => {
    const token = localStorage.getItem('supabase-auth-token');
    if (goalToUpdate) { 
      await apiRequest(`/goals/${goalToUpdate.id}`, 'PUT', token, formData);
    } else { 
      await apiRequest('/goals', 'POST', token, formData);
    }
    fetchData(); 
  };

  const handleFinalizeReview = async (reviewId: string, formData: any) => {
    const token = localStorage.getItem('supabase-auth-token');
    await apiRequest(`/reviews/${reviewId}/finalize`, 'PUT', token, formData);
    fetchData(); 
  };
  
  const handleFeedbackSubmit = async (formData: any) => {
    const token = localStorage.getItem('supabase-auth-token');
    await apiRequest(`/feedback`, 'POST', token, formData);
    fetchData(); 
  };

  const handleReviewCycleSubmit = async (formData: any) => {
    const token = localStorage.getItem('supabase-auth-token');
    try {
      if (cycleToUpdate) {
        await apiAdminRequest(`/admin/cycles/${cycleToUpdate.id}`, 'PUT', token, formData);
      } else {
        await apiAdminRequest('/admin/cycles', 'POST', token, formData);
      }
      fetchData(); 
    } catch (error) {
      console.error("Review Cycle Submission Failed:", error);
      throw error; 
    }
  };

  // Modal Openers
  const openGoalModal = (goal: any | null) => {
    setGoalToUpdate(goal);
    setShowGoalModal(true);
  };
  
  const openReviewModal = (review: any) => {
    setReviewToFinalize(review);
    setShowReviewModal(true);
  };
  
  const openBiasFormModal = (alert: any) => {
    setAlertToAddress(alert); 
    setShowBiasFormModal(true);
  };

  const openCycleModal = (cycle: any | null) => {
    setCycleToUpdate(cycle);
    setShowCycleFormModal(true);
  };

  const openFeedbackModal = () => {
    setShowFeedbackModal(true);
  };

  const openManualAlertModal = () => setShowManualAlertModal(true);

  // Stats Calculation
  const statsData = employeeData?.stats || managerData?.stats || adminData?.stats;
  const currentStats = statsData || {};

  if (view === 'manager' && managerData?.teamOverview) {
    const teamGoals = managerData.teamGoals || [];
    const teamReviews = managerData.teamReviews || [];
    const reviewsDue = teamReviews.filter((r: any) => r.status !== 'finalized').length;
    const totalGoals = teamGoals.length;
    const goalsMet = teamGoals.filter((g: any) => g.status === 'completed').length;

    currentStats.teamGoalsMet = totalGoals > 0 ? `${Math.round((goalsMet / totalGoals) * 100)}%` : 'N/A';
    currentStats.reviewsDue = reviewsDue;
    currentStats.highPerformers = managerData.teamOverview.filter((t:any) => t.lastScore > 8).length || 'N/A';
    currentStats.needSupport = managerData.teamOverview.filter((t:any) => t.lastScore < 6).length || 'N/A';
  } else if (view === 'employee' && employeeData) {
    currentStats.goalsCompleted = employeeData.goals?.filter((g: any) => g.status === 'completed').length || 'N/A';
    currentStats.performanceScore = employeeData.reviews?.[0]?.overall_rating || 'N/A';
    currentStats.skillsGrowth = employeeData.skills?.length > 0 ? '5%' : 'N/A';
    currentStats.reviewStatus = employeeData.reviews?.[0]?.status || 'N/A';
  }

  const tabs = {
    employee: [ { id: 'goals', label: 'My Goals', icon: Target }, { id: 'feedback', label: 'Feedback', icon: MessageCircle }, { id: 'reviews', label: 'Reviews', icon: FileText } ],
    manager: [ { id: 'team', label: 'Team Overview', icon: Users }, { id: 'goals', label: 'Goals Management', icon: Target }, { id: 'reviews', label: 'Reviews', icon: FileText } ],
    admin: [ { id: 'overview', label: 'Organization Overview', icon: PieChart }, { id: 'calibration', label: 'Calibration', icon: Target }, { id: 'cycles', label: 'Review Cycles', icon: FileText } ]
  };

  const renderContent = () => {
    if (isLoading && !employeeData && !managerData && !adminData) return <div className="text-center py-12 text-gray-500">Loading...</div>;
    if (error) return <div className="text-center py-12 text-red-500">Error: {error}</div>;

    switch(view) {
      case 'employee': return (
        <div className='space-y-6'>
          {activeTab === 'goals' && <GoalsWidget goals={employeeData?.goals} onUpdateGoal={openGoalModal} />}
          {activeTab === 'feedback' && <FeedbackWidget feedback={employeeData?.feedback} />}
          {activeTab === 'skills' && <SkillsRadarChart skills={employeeData?.skills} />}
         {activeTab === 'reviews' && (
           <div className="space-y-6">
             <ReviewTasksWidget 
               tasks={employeeTasks} 
               onStartReview={handleStartReview} 
                />
                <ReviewsWidget 
               reviews={employeeData?.reviews} 
               onFinalizeReview={() => { /* Employee doesn't finalize */ }} 
             />
            </div>
              )}
    </div>
      );
    case 'manager': return (
  <div className='space-y-6'>
    {activeTab === 'team' && <TeamOverview team={managerData?.teamOverview} onGiveFeedback={openFeedbackModal} />}
    {activeTab === 'goals' && <GoalsWidget goals={managerData?.teamGoals} isManager onUpdateGoal={openGoalModal} teamMembers={managerData?.teamOverview} />}
    {activeTab === 'reviews' && (
      <div className="space-y-6">
        <ReviewTasksWidget 
          tasks={managerData?.managerReviewTasks} 
          onStartReview={handleStartReview} 
        />
        <ReviewsWidget 
          reviews={managerData?.teamReviews} 
          isManager 
          team={managerData?.teamOverview} 
          onFinalizeReview={openReviewModal} 
        />
      </div>
    )}
  </div>
);
      case 'admin': return (
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <button 
                onClick={() => setShowManualAlertModal(true)} 
                className="btn-primary-sm flex items-center gap-1.5"
              >
                <AlertTriangle size={14} /> Manual Alert
              </button>
              
              <BiasDetectionAlertWidget 
                alerts={adminData?.biasAlerts} 
                onAddressBias={openBiasFormModal} 
                onManualCreate={openManualAlertModal}
              />
            </div>
          )}
          {activeTab === 'calibration' && <PerformanceCalibrationChart data={adminData?.calibrationData} />}
          {activeTab === 'cycles' && <AdminReviewCyclesWidget cycles={adminData?.reviewCycles} onAddCycle={() => openCycleModal(null)} />}
          {activeTab === 'settings' && <PlaceholderContent title="Performance Settings" />}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            {view.charAt(0).toUpperCase() + view.slice(1)} View
          </p>
        </div>
        <div className="flex justify-end">
          <div className="flex space-x-1 sm:space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg shadow-sm">
            <button 
              onClick={() => setView('employee')} 
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 ${
                view === 'employee' 
                  ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              My View
            </button>
            {(userRole === 'manager' ) && (
              <button 
                onClick={() => setView('manager')} 
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 ${
                  view === 'manager' 
                    ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Manager
              </button>
            )}
            {(userRole === 'admin' || userRole === 'hr') && (
              <button 
                onClick={() => setView('admin')} 
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 ${
                  view === 'admin' 
                    ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Admin view
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6"> 
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 h-28 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl"></div>
          ))
        ) : (
          (() => {
            if (view === 'employee') {
              return (
                <>
                  <StatCard label="Goals Completed" value={currentStats.goalsCompleted} icon={Target} color="blue" />
                  <StatCard label="Performance Score" value={currentStats.performanceScore} icon={Award} color="green" />
                  <StatCard label="Skills Growth" value={currentStats.skillsGrowth} icon={TrendingUp} color="purple" />
                  <StatCard label="Review Status" value={currentStats.reviewStatus} icon={FileText} color="yellow" />
                </>
              );
            }
            if (view === 'manager') {
              return (
                <>
                  <StatCard label="Team Goals Met" value={currentStats.teamGoalsMet} icon={Target} color="blue" />
                  <StatCard label="Reviews Due" value={currentStats.reviewsDue} icon={FileText} color="yellow" />
                  <StatCard label="High Performers" value={currentStats.highPerformers} icon={Star} color="green" />
                  <StatCard label="Need Support" value={currentStats.needSupport} icon={AlertTriangle} color="red" />
                </>
              );
            }
            if (view === 'admin') {
              return (
                <>
                  <StatCard label="Overall Score" value={currentStats.overallScore} icon={Award} color="blue" />
                  <StatCard label="Review Completion" value={currentStats.reviewCompletion} icon={FileText} color="green" />
                  <StatCard label="Bias Alerts" value={currentStats.biasAlerts} icon={AlertTriangle} color="red" />
                  <StatCard label="Top Performers" value={currentStats.topPerformers} icon={Star} color="yellow" />
                </>
              );
            }
            return null;
          })()
        )}
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs[view].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`flex items-center whitespace-nowrap px-1 py-4 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <tab.icon className="w-5 h-5 mr-2" /> {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>{renderContent()}</div>

      {/* MODALS */}
      {showManualAlertModal && 
    <ManualAlertFormModal 
        // 1. Passes the submission handler (which now includes fetchData)
        onSubmit={handleManualAlertSubmit} 
        onClose={() => setShowManualAlertModal(false)}
        // 2. Passes a simple success handler for UI cleanup only
        onSuccess={() => {
            // Note: fetchData is NOT called here anymore; it's inside the handler.
            setShowManualAlertModal(false); 
        }}
    />
}
      {showGoalModal && <GoalFormModal goal={goalToUpdate} teamMembers={managerData?.teamOverview} onClose={() => setShowGoalModal(false)} onSubmit={handleGoalSubmit} />}
      {showReviewModal && reviewToFinalize && <ReviewFormModal review={reviewToFinalize} employeeName={managerData?.teamOverview?.find((t:any) => t.id === reviewToFinalize.employee_id)?.name} onClose={() => setShowReviewModal(false)} onFinalize={handleFinalizeReview} />}
      {showFeedbackModal && <FeedbackFormModal teamMembers={view === 'manager' ? managerData?.teamOverview : undefined} onClose={() => setShowFeedbackModal(false)} onSubmit={handleFeedbackSubmit} />}
      {showBiasFormModal && 
        <BiasMitigationForm 
          alertData={alertToAddress}
          onClose={() => setShowBiasFormModal(false)} 
        />
      }
      {showCycleFormModal && <ReviewCycleFormModal cycle={cycleToUpdate} onClose={() => setShowCycleFormModal(false)} onSubmit={handleReviewCycleSubmit} />}
    </div>
  );
}