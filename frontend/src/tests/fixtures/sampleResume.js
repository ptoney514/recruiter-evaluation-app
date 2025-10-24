/**
 * Test fixture: Joseph Daffer resume (real Oracle export)
 * Used for testing PDF parsing, keyword matching, and evaluation logic
 */

export const josephDafferResume = {
  name: 'Joseph Daffer',
  filename: 'Joseph_Daffer_111129.pdf',
  text: `Joseph Daffer
Omaha United States
Campus Minister for Protestant and Ecumenical Ministry - 55
josephdaffer@gmail.com
402 210-4408

Joseph Daffer
2621 S 60 St, Omaha, NE 68106
402.210.4408 | josephdaffer@gmail.com

Summary of Qualifications
My background includes over 25 years of experience in all areas of Information Technology. My hands-on working knowledge and operational management experience has enabled me to take on a variety of roles over the course of my career. I have a proven track record of building IT departments from the ground up. Most recently I have been working in my area of expertise as an Information Security Officer. In my current role my responsibilities have evolved to include Business Continuity and Disaster Recovery, Vendor Management, Policy & Governance, as well as Audit and Compliance.

Areas of Expertise
IT Management Audit & Compliance Policy & Governance
Security Management Vendor Management Operational Management
Database Administration Physical Security Project Management
Documentation Testing & Troubleshooting Business Continuity & Disaster Recovery

Professional Experience
TS Banking Group Treynor, IA 2018 - Present
Information Security Officer 2020 - Present
Responsibilities include Business Continuity and Disaster Recovery, Vendor Management, Policy & Governance, as well as Audit and Compliance.

Database Engineer 2018 - 2021
Responsible for designing, developing, and administering the data warehouse to meet Business Intelligence and Data Science specifications.

Skarda Equipment Company Omaha, NE 2005 – 2018
Information Technology and Operations Manager 2013 – 2018
Provided direction for development, implementation, and refinement of company technology systems.

Certifications
• Certified Banking Business Continuity Professional SBS Cyber 2020
• Certified Banking Security Manager SBS Cyber 2021

Education
• Creighton University, M.A Christian Spirituality, Omaha, NE (Fall 2025)
• Bellevue University, M.S. Cybersecurity, Bellevue, NE, 2012
• Bellevue University, B.S. Business Information Systems, Bellevue, NE, 2003
• Nebraska College of Business, A.A. Computer Programming, Omaha, NE, 1996`
}

export const campusMinisterJob = {
  title: 'Campus Minister for Protestant and Ecumenical Ministry',
  summary: 'Seeking a Campus Minister to lead Protestant and ecumenical ministry programs at a Catholic university',
  requirements: [
    'Master of Divinity degree or equivalent theological education',
    'Experience in campus ministry or higher education ministry',
    'Knowledge of Protestant and ecumenical traditions',
    'Strong interpersonal and communication skills',
    'Ability to work collaboratively with diverse faith communities'
  ],
  duties: [
    'Lead Protestant and ecumenical worship services',
    'Provide pastoral care and spiritual direction to students',
    'Develop interfaith dialogue programs',
    'Coordinate with Catholic campus ministry'
  ],
  education: 'Master of Divinity or M.A. in Theology/Christian Spirituality',
  licenses: ''
}

export const itSecurityJob = {
  title: 'Information Security Officer',
  summary: 'Banking institution seeking an experienced Information Security Officer to manage security, compliance, and business continuity programs',
  requirements: [
    'Cybersecurity',
    'Information Security',
    'Audit and Compliance',
    'Business Continuity',
    'Vendor Management',
    'Policy and Governance',
    '5+ years experience in information security'
  ],
  duties: [
    'Manage information security program',
    'Ensure regulatory compliance',
    'Oversee business continuity planning',
    'Conduct security audits'
  ],
  education: 'Bachelor degree in Information Technology or related field',
  licenses: 'Security certifications preferred'
}
