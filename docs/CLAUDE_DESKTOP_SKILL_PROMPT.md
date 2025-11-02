# Prompt for Claude Desktop - Resume Evaluation Skill

**Copy this entire document and paste it into Claude Desktop to help you build a resume evaluation skill.**

---

Hi Claude! I need help creating a Claude Desktop skill for AI-powered resume evaluation. I have a web application that does this, and I want to replicate the core evaluation framework as a skill I can use directly in Claude Desktop.

## What I Want the Skill to Do

Create a skill that helps me evaluate job candidates using a two-stage framework:

**Stage 1: Resume Screening** (determines who to interview)
- Evaluate candidates based on resume only
- Score 0-100 using weighted components
- Output: Recommendation (Interview/Phone Screen/Decline)

**Stage 2: Final Hiring Decision** (determines who gets the offer)
- Evaluate using resume + interview performance + references
- Interview performance weighted most heavily (50%)
- Output: Final recommendation (STRONG HIRE/HIRE/DO NOT HIRE)

## The Evaluation Framework from My App

### Stage 1: Resume Screening

**Scoring Formula**:
```
Overall Score = (Qualifications × 0.40) + (Experience × 0.40) + (Risk Flags × 0.20)
```

**Components**:

1. **Qualifications Score (40%)**: Education, certifications, licenses, technical skills
   - 100 = Exceeds all requirements
   - 80-99 = Meets all requirements with extras
   - 60-79 = Meets most requirements
   - 40-59 = Meets some requirements
   - 0-39 = Missing critical qualifications

2. **Experience Score (40%)**: Years of experience, role similarity, achievements
   - 100 = Extensive relevant experience (10+ years)
   - 80-99 = Strong relevant experience (5-10 years)
   - 60-79 = Adequate experience (3-5 years)
   - 40-59 = Limited experience (1-3 years)
   - 0-39 = No relevant experience

3. **Risk Flags Score (20%)**: Employment gaps, job-hopping, red flags
   - 100 = No concerns whatsoever
   - 80-99 = Minor concerns, explainable
   - 60-79 = Moderate concerns
   - 40-59 = Significant concerns
   - 0-39 = Critical red flags

**Recommendation Thresholds**:
- **85-100**: "ADVANCE TO INTERVIEW" (strong match)
- **70-84**: "PHONE SCREEN FIRST" (potential fit, clarify concerns)
- **0-69**: "DECLINE" (insufficient match)

**Output Format for Each Candidate**:
```
Name: [Candidate Name]
Overall Score: [0-100]
Recommendation: [ADVANCE TO INTERVIEW | PHONE SCREEN FIRST | DECLINE]

Component Scores:
- Qualifications: [0-100]
- Experience: [0-100]
- Risk Flags: [0-100]

Key Strengths:
- [3-5 bullet points of specific strengths]

Key Concerns:
- [2-4 bullet points of concerns or gaps]

Suggested Interview Questions:
1. [Tailored question based on resume analysis]
2. [Question to probe a concern or gap]
3. [Question to verify a key strength]

Reasoning:
[1-2 paragraph explanation of the scoring and recommendation]
```

### Stage 2: Final Hiring Decision

**Scoring Formula**:
```
Final Score = (Resume × 0.25) + (Interview × 0.50) + (References × 0.25)
```

**Interview Performance (50% weight)** - Most important factor:
- Technical skills
- Communication
- Problem-solving
- Cultural fit
- Overall impression

**Resume Score (25% weight)**: Uses Stage 1 score

**References Score (25% weight)**: Reference feedback quality

**Recommendation Thresholds**:
- **85-100**: "STRONG HIRE" (exceptional candidate)
- **70-84**: "HIRE" (good candidate)
- **0-69**: "DO NOT HIRE" (concerns outweigh strengths)

## How the Skill Should Work

**Workflow**:

1. **User provides job description**:
   - Job title
   - Must-have requirements
   - Preferred requirements
   - Years of experience needed
   - Job summary/description

2. **User provides candidate resumes** (one at a time or in batch):
   - Candidate name
   - Resume text (or uploaded file)

3. **Skill evaluates each candidate**:
   - Analyzes against job requirements
   - Calculates scores for each component
   - Generates detailed output
   - Provides interview questions

4. **Skill provides summary**:
   - Ranked list of all candidates
   - Who to advance to interview
   - Who to phone screen
   - Who to decline
   - Top candidate highlighted

## Key Features from My App

**Multi-Resume Support**:
- Handle 1-50 resumes in a batch
- Evaluate them in parallel (conceptually)
- Rank by overall score
- Provide comparative analysis

**Smart Analysis**:
- Match keywords against requirements
- Identify years of experience
- Detect employment gaps
- Flag job-hopping (>4 jobs in 5 years)
- Assess education match

**Actionable Output**:
- Tailored interview questions for each candidate
- Specific strengths to explore in interview
- Concerns to clarify during phone screen
- Clear next steps for hiring manager

## Example Interaction

**User**: "I have a Senior Software Engineer position. Must-have requirements: React, Node.js, 5+ years experience, TypeScript. Preferred: AWS, PostgreSQL, team leadership."

**Skill**: "Got it! I'm ready to evaluate candidates for Senior Software Engineer. Please provide candidate resumes (you can provide multiple at once or one at a time)."

**User**: [Pastes resume text or uploads PDF]

**Skill**: [Provides detailed evaluation as shown in output format above]

**User**: [Provides 5 more resumes]

**Skill**: [Evaluates all, provides ranked summary]

## Technical Implementation Notes

**From my web app**:

1. **Prompt Structure** (from `api/ai_evaluator.py`):
   ```
   [Skill instructions with framework]

   ---

   TASK: Perform Stage 1 Resume Screening

   JOB DETAILS:
   [Title, department, requirements, etc.]

   CANDIDATE PROFILE:
   [Name, resume text]

   ---

   Evaluate and provide scores in the exact format specified above.
   ```

2. **Parsing Logic** (the skill should output structured text):
   - Use clear section headers
   - Use consistent formatting
   - Make it easy to copy/paste results

3. **Batch Processing**:
   - Keep job description in context
   - Evaluate candidates sequentially
   - Provide comparative summary at end

## What I Need from You (Claude Desktop)

Please help me create a `.md` skill file that:

1. **Implements the two-stage evaluation framework** described above
2. **Handles multiple resumes** in a session (maintains job context)
3. **Outputs structured evaluations** in the format specified
4. **Provides a ranked summary** when I'm done adding candidates
5. **Gives actionable next steps** (who to interview, who to screen, who to decline)

The skill should be conversational and guide me through the process step-by-step.

## Bonus Features (If Possible)

- Remember the job description throughout the session
- Let me add candidates incrementally
- Provide a final summary command (e.g., "summarize all candidates")
- Export results in a copy-paste friendly format
- Include interview question generation for top candidates

## Reference Materials

**My app's evaluation framework** is based on:
- Two-stage hiring process (Resume → Interview+References)
- Weighted scoring with clear thresholds
- Structured output for consistency
- Actionable interview questions
- Risk flag detection (gaps, job-hopping, credential mismatches)

The skill should feel like having a professional recruiting assistant that knows the two-stage evaluation methodology inside and out.

---

**Can you help me create this skill file?** Start by asking me any questions about the evaluation criteria, then help me structure it as a Claude Desktop skill.
