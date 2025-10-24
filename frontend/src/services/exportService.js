/**
 * Export Service
 * Handles exporting evaluation results to Excel and PDF formats
 */
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * Export evaluation results to Excel
 * @param {Object} evaluation - Evaluation data from session
 * @param {Object} results - Results data (regex or AI)
 * @param {string} mode - Evaluation mode ('regex' or 'ai')
 */
export function exportToExcel(evaluation, results, mode) {
  const workbook = XLSX.utils.book_new()

  // Sheet 1: Summary
  const summaryData = [
    ['Candidate Evaluation Report'],
    [''],
    ['Job Title', evaluation.job.title],
    ['Evaluation Mode', mode === 'ai' ? 'AI Evaluation (Claude Haiku)' : 'Regex Keyword Matching'],
    ['Evaluation Date', new Date().toLocaleDateString()],
    ['Total Candidates', results.summary?.totalCandidates || results.results?.length || 0],
    [''],
    ['Results Summary'],
    ['Advance to Interview', results.summary?.advanceToInterview || 0],
    ['Phone Screen First', results.summary?.phoneScreen || 0],
    ['Declined', results.summary?.declined || 0],
  ]

  if (mode === 'ai' && results.usage) {
    summaryData.push([''], ['Cost Analysis'])
    summaryData.push(['Total Cost', `$${results.usage.cost.toFixed(4)}`])
    summaryData.push(['Avg Cost per Candidate', `$${results.usage.avgCostPerCandidate.toFixed(4)}`])
    summaryData.push(['Input Tokens', results.usage.inputTokens])
    summaryData.push(['Output Tokens', results.usage.outputTokens])
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  // Sheet 2: Rankings
  const candidates = results.results || []
  const rankingsData = [
    ['Rank', 'Candidate Name', 'Score', 'Recommendation']
  ]

  if (mode === 'ai') {
    rankingsData[0].push('Qualifications Score', 'Experience Score', 'Risk Flags Score')
  } else {
    rankingsData[0].push('Matched Keywords', 'Missing Keywords')
  }

  candidates.forEach((candidate, index) => {
    const row = [
      index + 1,
      candidate.name,
      candidate.score,
      candidate.recommendation
    ]

    if (mode === 'ai') {
      row.push(
        candidate.qualificationsScore || 'N/A',
        candidate.experienceScore || 'N/A',
        candidate.riskFlagsScore || 'N/A'
      )
    } else {
      row.push(
        (candidate.matchedKeywords || []).join(', '),
        (candidate.missingKeywords || []).join(', ')
      )
    }

    rankingsData.push(row)
  })

  const rankingsSheet = XLSX.utils.aoa_to_sheet(rankingsData)
  XLSX.utils.book_append_sheet(workbook, rankingsSheet, 'Rankings')

  // Sheet 3: Detailed Analysis (AI mode only)
  if (mode === 'ai') {
    const analysisData = [['Candidate', 'Key Strengths', 'Key Concerns', 'Interview Questions', 'Reasoning']]

    candidates.forEach(candidate => {
      analysisData.push([
        candidate.name,
        (candidate.keyStrengths || []).map((s, i) => `${i + 1}. ${s}`).join('\n'),
        (candidate.keyConcerns || []).map((c, i) => `${i + 1}. ${c}`).join('\n'),
        (candidate.interviewQuestions || []).map((q, i) => `${i + 1}. ${q}`).join('\n'),
        candidate.reasoning || ''
      ])
    })

    const analysisSheet = XLSX.utils.aoa_to_sheet(analysisData)

    // Set column widths
    analysisSheet['!cols'] = [
      { wch: 20 }, // Candidate
      { wch: 50 }, // Strengths
      { wch: 50 }, // Concerns
      { wch: 60 }, // Questions
      { wch: 80 }  // Reasoning
    ]

    XLSX.utils.book_append_sheet(workbook, analysisSheet, 'Detailed Analysis')
  }

  // Generate filename
  const filename = `evaluation_${evaluation.job.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`

  // Save file
  XLSX.writeFile(workbook, filename)

  return filename
}

/**
 * Export evaluation results to PDF
 * @param {Object} evaluation - Evaluation data from session
 * @param {Object} results - Results data (regex or AI)
 * @param {string} mode - Evaluation mode ('regex' or 'ai')
 */
export function exportToPDF(evaluation, results, mode) {
  const doc = new jsPDF()
  const candidates = results.results || []

  // Title
  doc.setFontSize(20)
  doc.setFont(undefined, 'bold')
  doc.text('Candidate Evaluation Report', 14, 20)

  // Job Info
  doc.setFontSize(12)
  doc.setFont(undefined, 'normal')
  doc.text(`Job Title: ${evaluation.job.title}`, 14, 30)
  doc.text(`Evaluation Mode: ${mode === 'ai' ? 'AI Evaluation (Claude Haiku)' : 'Regex Keyword Matching'}`, 14, 36)
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 42)

  // Summary Statistics
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('Summary', 14, 52)
  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')
  doc.text(`Total Candidates: ${results.summary?.totalCandidates || candidates.length}`, 14, 58)
  doc.text(`Advance to Interview: ${results.summary?.advanceToInterview || 0}`, 14, 64)
  doc.text(`Phone Screen First: ${results.summary?.phoneScreen || 0}`, 14, 70)
  doc.text(`Declined: ${results.summary?.declined || 0}`, 14, 76)

  // Cost info (AI mode only)
  let yPosition = 82
  if (mode === 'ai' && results.usage) {
    doc.text(`Total Cost: $${results.usage.cost.toFixed(4)}`, 14, yPosition)
    yPosition += 6
  }

  // Rankings Table
  yPosition += 8
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('Candidate Rankings', 14, yPosition)

  yPosition += 6

  const tableData = candidates.map((candidate, index) => {
    const row = [
      index + 1,
      candidate.name,
      candidate.score,
      candidate.recommendation
    ]

    if (mode === 'ai') {
      row.push(
        `Q:${candidate.qualificationsScore || 'N/A'}\nE:${candidate.experienceScore || 'N/A'}\nR:${candidate.riskFlagsScore || 'N/A'}`
      )
    }

    return row
  })

  const tableHeaders = mode === 'ai'
    ? ['Rank', 'Name', 'Score', 'Recommendation', 'Breakdown']
    : ['Rank', 'Name', 'Score', 'Recommendation']

  doc.autoTable({
    startY: yPosition,
    head: [tableHeaders],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }, // primary-600
    styles: { fontSize: 9 },
    columnStyles: mode === 'ai' ? {
      0: { cellWidth: 15 },
      1: { cellWidth: 40 },
      2: { cellWidth: 20 },
      3: { cellWidth: 60 },
      4: { cellWidth: 35 }
    } : {
      0: { cellWidth: 15 },
      1: { cellWidth: 60 },
      2: { cellWidth: 20 },
      3: { cellWidth: 75 }
    }
  })

  // Detailed Analysis (AI mode only)
  if (mode === 'ai') {
    candidates.forEach((candidate, index) => {
      // Add new page for each candidate (except first)
      if (index > 0) {
        doc.addPage()
      } else {
        // Check if we need a new page
        if (doc.lastAutoTable.finalY > 240) {
          doc.addPage()
        }
      }

      let detailY = index === 0 ? doc.lastAutoTable.finalY + 10 : 20

      // Candidate Name
      doc.setFontSize(14)
      doc.setFont(undefined, 'bold')
      doc.text(`${index + 1}. ${candidate.name}`, 14, detailY)

      detailY += 8
      doc.setFontSize(11)
      doc.setFont(undefined, 'normal')
      doc.text(`Score: ${candidate.score}/100 | ${candidate.recommendation}`, 14, detailY)

      // Strengths
      detailY += 8
      doc.setFontSize(12)
      doc.setFont(undefined, 'bold')
      doc.text('Key Strengths:', 14, detailY)
      detailY += 6

      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      ;(candidate.keyStrengths || []).forEach(strength => {
        const lines = doc.splitTextToSize(`• ${strength}`, 180)
        doc.text(lines, 18, detailY)
        detailY += lines.length * 5
      })

      // Concerns
      detailY += 4
      doc.setFontSize(12)
      doc.setFont(undefined, 'bold')
      doc.text('Key Concerns:', 14, detailY)
      detailY += 6

      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      ;(candidate.keyConcerns || []).forEach(concern => {
        const lines = doc.splitTextToSize(`• ${concern}`, 180)
        doc.text(lines, 18, detailY)
        detailY += lines.length * 5
      })

      // Check if we need a new page for questions
      if (detailY > 240) {
        doc.addPage()
        detailY = 20
      }

      // Interview Questions
      detailY += 4
      doc.setFontSize(12)
      doc.setFont(undefined, 'bold')
      doc.text('Suggested Interview Questions:', 14, detailY)
      detailY += 6

      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      ;(candidate.interviewQuestions || []).forEach((question, qi) => {
        const lines = doc.splitTextToSize(`${qi + 1}. ${question}`, 180)
        doc.text(lines, 18, detailY)
        detailY += lines.length * 5
      })

      // Reasoning
      if (candidate.reasoning) {
        // Check if we need a new page for reasoning
        if (detailY > 220) {
          doc.addPage()
          detailY = 20
        }

        detailY += 4
        doc.setFontSize(12)
        doc.setFont(undefined, 'bold')
        doc.text('AI Reasoning:', 14, detailY)
        detailY += 6

        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        const reasoningLines = doc.splitTextToSize(candidate.reasoning, 180)
        doc.text(reasoningLines, 14, detailY)
      }
    })
  }

  // Generate filename
  const filename = `evaluation_${evaluation.job.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`

  // Save file
  doc.save(filename)

  return filename
}

export const exportService = {
  exportToExcel,
  exportToPDF
}
