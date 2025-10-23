import { supabase } from './supabase'

export const interviewRatingsService = {
  // Get all interview ratings for a candidate
  async getByCandidateId(candidateId) {
    const { data, error } = await supabase
      .from('interview_ratings')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('interview_date', { ascending: false })

    if (error) throw error
    return data
  },

  // Get single interview rating by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('interview_ratings')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create new interview rating
  async create(ratingData) {
    const { data, error } = await supabase
      .from('interview_ratings')
      .insert([ratingData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update interview rating
  async update(id, ratingData) {
    const { data, error } = await supabase
      .from('interview_ratings')
      .update(ratingData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete interview rating
  async delete(id) {
    const { error } = await supabase
      .from('interview_ratings')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Get all interview ratings with candidate info
  async getAllWithCandidates() {
    const { data, error } = await supabase
      .from('interview_ratings')
      .select(`
        *,
        candidates (
          id,
          full_name,
          email,
          current_title
        )
      `)
      .order('interview_date', { ascending: false })

    if (error) throw error
    return data
  }
}
