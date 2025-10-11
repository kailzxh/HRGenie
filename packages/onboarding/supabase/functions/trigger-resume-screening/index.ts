import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestPayload {
  applicationId: string;
  resumeUrl: string;
  jobRequirements: any;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const { applicationId, resumeUrl, jobRequirements }: RequestPayload = await req.json();

    console.log('Resume screening triggered for application:', applicationId);

    /*
     * PRODUCTION IMPLEMENTATION:
     * 
     * This Edge Function would invoke a GCP Cloud Function that:
     * 1. Downloads the resume from Supabase Storage
     * 2. Parses the PDF/DOCX content
     * 3. Calls Vertex AI Gemini API with a prompt like:
     *    "Extract the following from this resume: skills, years_of_experience, 
     *     education, previous_companies. Return as JSON."
     * 4. Calculates a match score based on job requirements
     * 5. Returns the analysis and score
     * 
     * Example GCP Cloud Function call:
     * const gcpResponse = await fetch(
     *   'https://REGION-PROJECT_ID.cloudfunctions.net/resume-screener',
     *   {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify({ resumeUrl, jobRequirements })
     *   }
     * );
     * 
     * const { analysis, score } = await gcpResponse.json();
     */

    const mockAnalysis = {
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
      years_of_experience: 5,
      education: 'B.S. Computer Science',
      previous_companies: ['Tech Corp', 'Startup Inc'],
      certifications: ['AWS Certified Developer'],
    };

    const mockScore = 85;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/applications?id=eq.${applicationId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          resume_analysis: mockAnalysis,
          resume_score: mockScore,
          status: mockScore >= 70 ? 'github_analysis' : 'rejected',
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error('Failed to update application');
    }

    return new Response(
      JSON.stringify({ success: true, score: mockScore, analysis: mockAnalysis }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in resume screening:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});