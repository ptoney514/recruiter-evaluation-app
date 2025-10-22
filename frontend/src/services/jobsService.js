import { supabase } from './supabase'

export const jobsService = {
  // Get all jobs
  async getAll() {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get single job by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create new job
  async create(jobData) {
    const { data, error } = await supabase
      .from('jobs')
      .insert([jobData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update job
  async update(id, jobData) {
    const { data, error } = await supabase
      .from('jobs')
      .update({ ...jobData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete job
  async delete(id) {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Get job with candidates and evaluations
  async getWithCandidates(id) {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        candidates (
          *,
          evaluations (*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }
}
