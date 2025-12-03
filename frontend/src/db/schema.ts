import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table - for authentication
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Sessions table - for Better Auth
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Jobs table - job postings with requirements
export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  department: text('department'),
  location: text('location'),
  summary: text('summary'),
  // JSON stored as text - Drizzle handles serialization
  mustHaveRequirements: text('must_have_requirements', { mode: 'json' }).$type<string[]>().default([]),
  preferredRequirements: text('preferred_requirements', { mode: 'json' }).$type<string[]>().default([]),
  status: text('status').default('active'), // active, closed, draft
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Candidates table - applicants linked to jobs
export const candidates = sqliteTable('candidates', {
  id: text('id').primaryKey(),
  jobId: text('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  resumeText: text('resume_text'),
  resumeFilePath: text('resume_file_path'),

  // A-T-Q Scoring (new model)
  quickScore: integer('quick_score'), // 0-100, from Ollama
  quickScoreModel: text('quick_score_model'), // phi3, mistral, llama3
  quickScoreAt: text('quick_score_at'),
  quickScoreAnalysis: text('quick_score_analysis', { mode: 'json' }).$type<{
    accomplishments?: { score: number; evidence: string };
    trajectory?: { score: number; evidence: string };
    qualifications?: { score: number; mustHaveMet: number; mustHaveTotal: number; preferredMet: number; preferredTotal: number };
    observations?: string[];
    reasoning?: string;
  }>(),

  stage1Score: real('stage1_score'), // 0-100, from Claude
  stage1AScore: real('stage1_a_score'), // Accomplishments component
  stage1TScore: real('stage1_t_score'), // Trajectory component
  stage1QScore: real('stage1_q_score'), // Qualifications component
  stage1EvaluatedAt: text('stage1_evaluated_at'),

  stage2Score: real('stage2_score'), // 0-100, full evaluation
  stage2EvaluatedAt: text('stage2_evaluated_at'),

  // Recommendation
  recommendation: text('recommendation'), // INTERVIEW, PHONE_SCREEN, DECLINE
  scoringModel: text('scoring_model').default('ATQ'), // ATQ (new) or QER (legacy)

  // Status tracking
  status: text('status').default('pending'), // pending, evaluated, interviewing, hired, rejected
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Evaluations table - detailed evaluation records
export const evaluations = sqliteTable('evaluations', {
  id: text('id').primaryKey(),
  candidateId: text('candidate_id').notNull().references(() => candidates.id, { onDelete: 'cascade' }),

  // Overall score
  score: real('score').notNull(), // 0-100
  scoringModel: text('scoring_model').default('ATQ').notNull(),

  // A-T-Q Component scores
  aScore: real('a_score'), // Accomplishments (50%)
  tScore: real('t_score'), // Trajectory (30%)
  qScore: real('q_score'), // Qualifications (20%)

  // A-T-Q Sub-components (stored as JSON)
  accomplishmentsAnalysis: text('accomplishments_analysis', { mode: 'json' }).$type<{
    comparableWork: { score: number; evidence: string };
    scaleMatch: { score: number; evidence: string };
    impactEvidence: { score: number; evidence: string };
  }>(),
  trajectoryAnalysis: text('trajectory_analysis', { mode: 'json' }).$type<{
    growthPattern: { score: number; evidence: string };
    progressionVelocity: { score: number; evidence: string };
    intentionality: { score: number; evidence: string };
  }>(),
  qualificationsAnalysis: text('qualifications_analysis', { mode: 'json' }).$type<{
    mustHavesMet: string[];
    mustHavesNotMet: string[];
    preferredMet: string[];
    preferredNotMet: string[];
  }>(),

  // Evaluation output
  recommendation: text('recommendation'), // INTERVIEW, PHONE_SCREEN, DECLINE
  reasoning: text('reasoning'),
  strengths: text('strengths', { mode: 'json' }).$type<string[]>(),
  concerns: text('concerns', { mode: 'json' }).$type<string[]>(),
  interviewQuestions: text('interview_questions', { mode: 'json' }).$type<string[]>(),
  observations: text('observations', { mode: 'json' }).$type<string[]>(), // Contextual notes (no penalties)

  // AI metadata
  llmProvider: text('llm_provider'), // anthropic, ollama
  llmModel: text('llm_model'), // claude-3-5-haiku, phi3, etc.
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  cost: real('cost'), // USD

  // Version tracking
  version: integer('version').default(1),
  evaluationStage: text('evaluation_stage').default('stage1'), // quick, stage1, stage2

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type Candidate = typeof candidates.$inferSelect;
export type NewCandidate = typeof candidates.$inferInsert;
export type Evaluation = typeof evaluations.$inferSelect;
export type NewEvaluation = typeof evaluations.$inferInsert;
