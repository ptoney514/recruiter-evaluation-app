"""
Parse Performance Profile API Endpoint
Parses uploaded/pasted Performance Profile text and extracts structured Lou Adler 8 questions
Uses Claude to intelligently parse profiles from markdown, text, or unstructured format
"""

import json
import os
from anthropic import Anthropic

def parse_performance_profile(profile_text: str) -> dict:
    """
    Parse Performance Profile text into structured 8-question format

    Args:
        profile_text: Unstructured Performance Profile text (from .md, .txt, paste)

    Returns:
        dict with Lou Adler 8 questions:
        - year_1_outcomes: array of critical accomplishments
        - biggest_challenge: single hardest obstacle
        - comparable_experience: array of relevant experience patterns
        - dealbreakers: array of red flags
        - motivation_drivers: array of motivation types
        - must_have_requirements: array of required qualifications
        - nice_to_have_requirements: array of preferred qualifications
        - trajectory_patterns: array of career progression patterns
        - context_notes: special considerations
    """

    client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    parsing_prompt = f"""You are a Performance Profile parser. Extract Lou Adler's 8 Performance-Based Hiring questions from this text.

PERFORMANCE PROFILE TEXT:
{profile_text}

Extract the 8 questions into this EXACT JSON structure (return ONLY valid JSON, no markdown):

{{
  "year_1_outcomes": ["outcome 1", "outcome 2", "outcome 3"],
  "biggest_challenge": "single hardest obstacle text",
  "comparable_experience": ["experience pattern 1", "experience pattern 2"],
  "dealbreakers": ["dealbreaker 1", "dealbreaker 2"],
  "motivation_drivers": ["mission", "building", "autonomy", "impact", "prestige", "stability", "mastery"],
  "must_have_requirements": ["must-have 1", "must-have 2"],
  "nice_to_have_requirements": ["nice-to-have 1", "nice-to-have 2"],
  "trajectory_patterns": ["pattern 1", "pattern 2"],
  "context_notes": "special context and considerations"
}}

RULES:
- Return ONLY the JSON object, no other text
- Use empty arrays [] for questions not found
- Use empty string "" for text fields not found
- motivation_drivers must be from this list ONLY: mission, building, autonomy, impact, prestige, stability, mastery
- Extract list items into arrays (bullets, numbers, etc.)
- For multi-paragraph text, keep it as one string
- Be generous in extraction - if it looks like an outcome, include it

EXAMPLE INPUT:
"# Performance Profile: Chief Internal Auditor

## Year 1 Outcomes
- Complete risk assessment of 50+ departments
- Build audit committee trust
- Implement data analytics

## Biggest Challenge
Navigating higher ed politics while maintaining independence

## Motivation
Mission-driven, building something new"

EXAMPLE OUTPUT:
{{"year_1_outcomes": ["Complete risk assessment of 50+ departments", "Build audit committee trust", "Implement data analytics"], "biggest_challenge": "Navigating higher ed politics while maintaining independence", "comparable_experience": [], "dealbreakers": [], "motivation_drivers": ["mission", "building"], "must_have_requirements": [], "nice_to_have_requirements": [], "trajectory_patterns": [], "context_notes": ""}}

Now extract from the profile text above:"""

    try:
        response = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=2000,
            temperature=0,
            messages=[{
                "role": "user",
                "content": parsing_prompt
            }]
        )

        # Parse Claude's response
        extracted_text = response.content[0].text.strip()

        # Remove markdown code blocks if present
        if extracted_text.startswith("```json"):
            extracted_text = extracted_text.replace("```json", "").replace("```", "").strip()
        elif extracted_text.startswith("```"):
            extracted_text = extracted_text.replace("```", "").strip()

        parsed_profile = json.loads(extracted_text)

        # Validate motivation_drivers
        valid_drivers = ["mission", "building", "autonomy", "impact", "prestige", "stability", "mastery"]
        if parsed_profile.get("motivation_drivers"):
            parsed_profile["motivation_drivers"] = [
                d for d in parsed_profile["motivation_drivers"]
                if d in valid_drivers
            ]

        # Calculate cost
        input_tokens = response.usage.input_tokens
        output_tokens = response.usage.output_tokens
        cost = (input_tokens * 0.00000025) + (output_tokens * 0.00000125)

        return {
            "success": True,
            "data": parsed_profile,
            "metadata": {
                "model": "claude-3-5-haiku-20241022",
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "cost": round(cost, 6)
            }
        }

    except json.JSONDecodeError as e:
        return {
            "success": False,
            "error": "Failed to parse AI response",
            "details": str(e)
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Parsing failed",
            "details": str(e)
        }


# For local testing
if __name__ == "__main__":
    test_profile = """
    # Performance Profile: Senior Software Engineer

    ## Year 1 Outcomes
    - Build microservices architecture
    - Scale team from 3 to 8 engineers
    - Reduce deployment time by 50%

    ## Biggest Challenge
    Migrating legacy monolith to microservices without downtime

    ## Must-Haves
    - 5+ years React/TypeScript
    - Team leadership experience
    - System design skills

    ## Motivation
    Building something new, technical mastery
    """

    result = parse_performance_profile(test_profile)
    print(json.dumps(result, indent=2))
