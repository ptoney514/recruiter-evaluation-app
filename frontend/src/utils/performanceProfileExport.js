/**
 * Performance Profile Export Utility
 * Generates downloadable markdown file from Performance Profile data
 */

/**
 * Export Performance Profile as markdown file
 *
 * @param {Object} profile - Performance Profile object
 * @param {string} projectTitle - Job title for filename
 */
export function exportPerformanceProfile(profile, projectTitle = 'Project') {
  const markdown = generateMarkdown(profile, projectTitle)

  // Create blob and trigger download
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  // Generate filename
  const sanitizedTitle = projectTitle
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .slice(0, 50)

  link.href = url
  link.download = `performance_profile_${sanitizedTitle}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate markdown content from Performance Profile
 */
function generateMarkdown(profile, projectTitle) {
  const sections = []

  // Header
  sections.push(`# Performance Profile: ${projectTitle}`)
  sections.push('')
  sections.push('**Based on Lou Adler\'s Performance-Based Hiring Methodology**')
  sections.push('')
  sections.push(`*Exported: ${new Date().toLocaleDateString()}*`)
  sections.push('')
  sections.push('---')
  sections.push('')

  // Question 1: Year 1 Outcomes
  if (profile.year_1_outcomes?.length > 0) {
    sections.push('## 1. Year 1 Outcomes')
    sections.push('')
    sections.push('*What are the 2-3 most critical things this person needs to accomplish in their first year?*')
    sections.push('')
    profile.year_1_outcomes.forEach((outcome, idx) => {
      sections.push(`${idx + 1}. ${outcome}`)
    })
    sections.push('')
  }

  // Question 2: Biggest Challenge
  if (profile.biggest_challenge) {
    sections.push('## 2. Biggest Challenge')
    sections.push('')
    sections.push('*What\'s the single hardest obstacle this person will face in their first 6 months?*')
    sections.push('')
    sections.push(profile.biggest_challenge)
    sections.push('')
  }

  // Question 3: Comparable Experience
  if (profile.comparable_experience?.length > 0) {
    sections.push('## 3. Comparable Experience')
    sections.push('')
    sections.push('*If you saw this specific work experience on a resume, you\'d think "they\'ve done this before"—what is it?*')
    sections.push('')
    profile.comparable_experience.forEach(exp => {
      sections.push(`- ${exp}`)
    })
    sections.push('')
  }

  // Question 4: Dealbreakers
  if (profile.dealbreakers?.length > 0) {
    sections.push('## 4. Dealbreakers')
    sections.push('')
    sections.push('*What would cause someone to fail catastrophically in this role?*')
    sections.push('')
    profile.dealbreakers.forEach(db => {
      sections.push(`- ${db}`)
    })
    sections.push('')
  }

  // Question 5: Motivation Fit
  if (profile.motivation_drivers?.length > 0) {
    sections.push('## 5. Motivation Fit')
    sections.push('')
    sections.push('*What energizes someone to excel in this role?*')
    sections.push('')
    sections.push(`**Drivers:** ${profile.motivation_drivers.join(', ')}`)
    sections.push('')
  }

  // Question 6: Must-Haves vs Nice-to-Haves
  if (profile.must_have_requirements?.length > 0 || profile.nice_to_have_requirements?.length > 0) {
    sections.push('## 6. Must-Haves vs Nice-to-Haves')
    sections.push('')

    if (profile.must_have_requirements?.length > 0) {
      sections.push('### Must-Haves (Required)')
      profile.must_have_requirements.forEach(req => {
        sections.push(`- ${req}`)
      })
      sections.push('')
    }

    if (profile.nice_to_have_requirements?.length > 0) {
      sections.push('### Nice-to-Haves (Preferred)')
      profile.nice_to_have_requirements.forEach(req => {
        sections.push(`- ${req}`)
      })
      sections.push('')
    }
  }

  // Question 7: Trajectory Patterns
  if (profile.trajectory_patterns?.length > 0) {
    sections.push('## 7. Trajectory Pattern')
    sections.push('')
    sections.push('*What career progression pattern suggests this person is ready for THIS role?*')
    sections.push('')
    profile.trajectory_patterns.forEach(pattern => {
      sections.push(`- ${pattern}`)
    })
    sections.push('')
  }

  // Question 8: Context Notes
  if (profile.context_notes) {
    sections.push('## 8. Context & Special Considerations')
    sections.push('')
    sections.push('*Any special context about this role, organization, or search?*')
    sections.push('')
    sections.push(profile.context_notes)
    sections.push('')
  }

  // Footer
  sections.push('---')
  sections.push('')
  sections.push('*This Performance Profile can be uploaded to new projects to reuse this evaluation criteria.*')

  return sections.join('\n')
}

/**
 * Copy Performance Profile to clipboard as formatted text
 */
export async function copyPerformanceProfile(profile, projectTitle) {
  const markdown = generateMarkdown(profile, projectTitle)

  try {
    await navigator.clipboard.writeText(markdown)
    return { success: true }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return { success: false, error: error.message }
  }
}
