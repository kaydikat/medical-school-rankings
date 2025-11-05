# Medical School Rankings
The U.S World and Status Report stopped ranking medical schools in 2022. Because of this, unofficial sites made by med students (e.g Admit.org) have become the go to for medical school rankings. These sites lack credibility however, due to the fact that how the schools are ranked solely on the opinion of the one person who created them. Harvard is rated first on Admit.org for example, due to it having billions in NIH funding, but many may feel that NIH funding per faculty is more important than overall funding. Because of this, we had set out to create **medicalschoolrankings.org**, a crowdsourced, transparent, and customizable medical school ranking platform that reflects the collective priorities of pre-meds, medical stuents, researchers, and physicians.

**medicalschoolrankings.org** allows users to assign their own weights to the following key metrics:
- median MCAT
- median GPA
- Research Funding Per Faculty
- Count Nationally Ranked Specialties
- Count T10 Ranked Specialties
- Avg Indebtedness ($)
- Full NIH Funding
- Yiel %
- % Receiving Aid
- URM %
- Low SES %

They can then instantly generate personalized rankings depending on what they find the most important in a medical school. More importantly, users can **submit their weights** (with optional demographic and academic context) to contribute to a **live, aggregated "Official Ranking** that evolves with community input.

By combining real data with real user priorities, we aim to create the most credible, representatice, and useful medical school rankings system available.

See initial site here: https://josephiturner.com/med_school_rankings.html

## ERD
<img width="1542" height="836" alt="drawSQL-image-export-2025-11-05" src="https://github.com/user-attachments/assets/616e8e74-89f4-45fe-9b7f-1768edee94b3" />

## System Design
<img width="1410" height="584" alt="Blank diagram (3)" src="https://github.com/user-attachments/assets/dd627a27-3746-4a92-bf12-0ddfaeb63831" />

## Initial Goals
- 11/5/25 - Design Docs should be finished
- 11/12/25
  - Setup Supabase and Vercel
  - Convert initial html to React
  - Create Home, Calculate Rankings, Submit Weights, and about pages 
- 11/19/25 - Create Supabase Postgres tables and implement API/Backend
- 12/26/25 - Hook up frontend to Database with HTTP requests
- 12/3/25 - Implement Local Storage and loosends
- 12/8/25 - Present in class
