/**
 * Extract must-have and preferred requirements from a job description
 * Uses simple keyword matching and bullet point detection
 */
export function extractRequirements(description) {
  if (!description) {
    return { mustHave: [], niceToHave: [] };
  }

  const lines = description.split('\n').map(line => line.trim()).filter(Boolean);

  let mustHave = [];
  let niceToHave = [];
  let currentSection = null;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Detect section headers
    if (
      lowerLine.includes('required') ||
      lowerLine.includes('must have') ||
      lowerLine.includes('essential')
    ) {
      currentSection = 'must';
      continue;
    }

    if (
      lowerLine.includes('preferred') ||
      lowerLine.includes('nice to have') ||
      lowerLine.includes('desired')
    ) {
      currentSection = 'nice';
      continue;
    }

    // Extract bullet points and numbered items
    if (line.match(/^[\s]*[-•*]\s+/) || line.match(/^[\s]*\d+\.\s+/)) {
      const requirement = line.replace(/^[\s]*[-•*]\s+/, '').replace(/^[\s]*\d+\.\s+/, '').trim();

      if (requirement) {
        if (currentSection === 'must') {
          mustHave.push(requirement);
        } else if (currentSection === 'nice') {
          niceToHave.push(requirement);
        }
      }
    }
  }

  // If no sections detected, try to infer from entire description
  if (mustHave.length === 0 && niceToHave.length === 0) {
    // Extract any bullet points as must-haves
    const bulletPoints = lines.filter(line => line.match(/^[\s]*[-•*]\s+/));
    mustHave = bulletPoints.map(line =>
      line.replace(/^[\s]*[-•*]\s+/, '').trim()
    ).filter(Boolean);
  }

  return {
    mustHave: mustHave.slice(0, 10), // Limit to 10 items
    niceToHave: niceToHave.slice(0, 10)
  };
}
