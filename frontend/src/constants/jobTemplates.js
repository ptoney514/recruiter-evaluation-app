/**
 * Pre-defined job description templates for common roles
 * Makes it easy to get started with standard job types
 */

export const JOB_TEMPLATES = {
  blank: {
    name: 'Start Blank',
    title: '',
    summary: '',
    requirements: [],
    duties: [],
    education: '',
    licenses: ''
  },
  nurse: {
    name: 'Registered Nurse',
    title: 'Registered Nurse (RN)',
    summary: 'Seeking an experienced Registered Nurse to provide high-quality patient care',
    requirements: [
      'Active RN license',
      'BSN or ADN from accredited nursing program',
      '2+ years clinical nursing experience',
      'BLS and ACLS certification',
      'Strong clinical assessment skills'
    ],
    duties: [
      'Provide direct patient care and treatment',
      'Administer medications and treatments as prescribed',
      'Monitor patient vital signs and condition',
      'Collaborate with interdisciplinary healthcare team',
      'Maintain accurate patient records and documentation'
    ],
    education: 'BSN or ADN required, BSN preferred',
    licenses: 'Active RN license, BLS, ACLS'
  },
  professor: {
    name: 'Assistant Professor',
    title: 'Assistant Professor',
    summary: 'Tenure-track faculty position in research and teaching',
    requirements: [
      'PhD in relevant field or ABD with completion expected',
      'Evidence of research potential and scholarly publications',
      'University-level teaching experience',
      'Strong communication and presentation skills',
      'Commitment to inclusive pedagogy'
    ],
    duties: [
      'Teach undergraduate and graduate courses',
      'Conduct original research and publish in peer-reviewed journals',
      'Advise and mentor students',
      'Participate in department and university service',
      'Seek external funding for research'
    ],
    education: 'PhD required',
    licenses: ''
  },
  engineer: {
    name: 'Software Engineer',
    title: 'Senior Software Engineer',
    summary: 'Seeking experienced software engineer to build scalable applications',
    requirements: [
      '5+ years software development experience',
      'Strong proficiency in modern programming languages',
      'Experience with cloud platforms (AWS, Azure, or GCP)',
      'Database design and optimization experience',
      'Excellent problem-solving skills'
    ],
    duties: [
      'Design, develop, and maintain software applications',
      'Write clean, testable, and well-documented code',
      'Collaborate with cross-functional teams',
      'Participate in code reviews and technical discussions',
      'Mentor junior developers'
    ],
    education: "Bachelor's degree in Computer Science or equivalent experience",
    licenses: ''
  },
  campusMinister: {
    name: 'Campus Minister',
    title: 'Campus Minister - Graduate Ministry',
    summary: 'Seeking experienced campus minister for graduate and professional student ministry',
    requirements: [
      "Master's degree in theology, divinity, pastoral studies, or related field",
      '3+ years campus ministry experience',
      'Practicing member of the Catholic faith',
      'Knowledge of Ignatian spirituality and Jesuit charism',
      'CPE (Clinical Pastoral Education) certification preferred',
      'Strong pastoral care and counseling skills'
    ],
    duties: [
      'Provide spiritual direction and pastoral care to graduate students',
      'Plan and lead liturgies, retreats, and spiritual programs',
      'Build relationships with students across professional schools',
      'Collaborate with Jesuit community and campus ministry team',
      'Develop and implement ministry programming for 22-39 age demographic'
    ],
    education: "Master's in theology/divinity/pastoral studies required",
    licenses: 'CPE certification preferred'
  }
}
