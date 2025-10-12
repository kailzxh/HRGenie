
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/ai-interview-proxy', (req, res) => {
  try {
    const { applicationId, message, interviewType, code, language } = req.body;

    console.log(`AI ${interviewType} interview proxy called for application:`, applicationId);

    let mockResponse = '';

    if (interviewType === 'technical') {
      if (code) {
        mockResponse = `I've reviewed your code submission. Here's my analysis:\n\nIn production, this would:\n1. Execute your code via GCP Cloud Run (Judge0 sandbox)\n2. Test against hidden test cases\n3. Analyze with Gemini for:\n   - Time complexity: O(n)\n   - Space complexity: O(1)\n   - Code quality: Good use of descriptive variables\n   - Best practices: Consider edge cases for empty inputs\n\nCan you explain your approach and why you chose this solution?`;
      } else {
        mockResponse = `That's an interesting point. In a production environment, I would use Vertex AI Agent Builder to provide contextual responses based on our conversation history and the coding challenge at hand. I can help clarify the problem, discuss approaches, or evaluate your solution.\n\nWhat specific aspect would you like to discuss?`;
      }
    } else {
      mockResponse = `Thank you for sharing that experience. In production, this would connect to Vertex AI Agent Builder configured as an HR interviewer using the STAR framework.\n\nThe AI would:\n- Analyze your response using Gemini\n- Evaluate communication clarity\n- Assess cultural fit indicators\n- Generate follow-up questions\n\nFor this demo, let me ask: How did your actions in that situation demonstrate leadership or problem-solving skills?`;
    }

    res.json({
      success: true,
      response: mockResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in AI interview proxy:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

