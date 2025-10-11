import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestPayload {
  applicationId: string;
  githubUrl: string;
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

    const { applicationId, githubUrl, jobRequirements }: RequestPayload = await req.json();

    console.log('GitHub analysis triggered for application:', applicationId);

    /*
     * PRODUCTION IMPLEMENTATION:
     * 
     * This Edge Function would invoke a GCP Cloud Function that:
     * 1. Extracts GitHub username from the URL
     * 2. Uses GitHub API to fetch:
     *    - Public repositories
     *    - README files from top repos
     *    - Key source code files
     *    - Commit history and frequency
     *    - Stars, forks, and contributions
     * 3. Calls Vertex AI Gemini API with a prompt like:
     *    "Analyze this GitHub profile and code samples. Evaluate:
     *     - Code quality and best practices
     *     - Project complexity and scope
     *     - Technologies used and proficiency
     *     - Alignment with job requirements: {jobRequirements}
     *     Return a score (0-100) and detailed analysis as JSON."
     * 4. Returns the GitHub score and analysis
     * 
     * Example GCP Cloud Function call:
     * const gcpResponse = await fetch(
     *   'https://REGION-PROJECT_ID.cloudfunctions.net/github-analyzer',
     *   {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify({ githubUrl, jobRequirements })
     *   }
     * );
     * 
     * const { analysis, score } = await gcpResponse.json();
     */

    const mockAnalysis = {
      top_languages: ['JavaScript', 'TypeScript', 'Python'],
      total_repos: 24,
      total_stars: 156,
      code_quality_score: 88,
      project_highlights: [
        'E-commerce platform with microservices architecture',
        'Machine learning project with 50+ stars',
        'Open-source contributions to React ecosystem',
      ],
      strengths: [
        'Strong understanding of modern JavaScript frameworks',
        'Experience with cloud deployments',
        'Active open-source contributor',
      ],
      areas_for_improvement: [
        'Limited documentation in some projects',
        'Could benefit from more test coverage',
      ],
    };

    const mockScore = 82;

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
          github_analysis: mockAnalysis,
          github_score: mockScore,
          status: mockScore >= 70 ? 'technical_interview' : 'rejected',
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
    console.error('Error in GitHub analysis:', error);
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