## Final Report
1. **Summary of the project (one to three sentences).** Shown below.
2. **Diagrams, demo video or gif, etc.** Shown below.
3. **What did you learn in this project?** I learned how to use third party front-end and back-end applications such as Supabase and Vercel to help me with my project. They were super useful when it came to deploying my project and ensuring it was secure. I also got better with working with databases and making websites in general.
4. **How did you use AI to assist in building your project? Please, describe.** I used Gemini 3 to create most of the frontend and it was super useful.
5. **Discuss why this project is interesting to you!** My husband is a current medical student at NYU and I disagreed with Admit.org about his school's rankings, so I wanted to make my own.
6. **Key learnings from the project.**
- Building a website is easy, especially if you use AI.
- Marketing and getting others to use your website is hard.
- I learned a lot about PostGres databasess and how to perform operations on them.
7. **Explanation if applicable of failover strategy, scaling characteristics, performance characteristics, authentication, concurrency, etc.**
- I used Resend to send verification emails to verify you email to prevent bots. 
- Resend has a generous free tier of 3000 emails. If the website becomes big though, I'll have to decide if I'm willing to pay for these third-parties.

# Medical School Rankings
## Summary
The U.S World and Status Report stopped ranking medical schools in 2023. Because of this, unofficial sites made by med students (e.g Admit.org) have become the go to for medical school rankings. Harvard is rated first on Admit.org for example, due to it having billions in NIH funding, but many may feel that NIH funding per faculty is more important than overall funding. In order to move beyond single-opinion rankings and incorporate a broader, more representative set of priorities, we set out to create **medicalschoolrankings.org**, a crowdsourced, transparent, and customizable medical school ranking platform that reflects the collective priorities of pre-meds, medical stuents, researchers, and physicians.

**medicalschoolrankings.org** allows users to assign their own weights to the following key metrics:
- MCAT
- GPA
- Total NIH Funding
- NIH/Faculty
- Avg Debt
- Total Cost
- Tuition + Fees
- Ranked Specialties
- Top 10 Specialties
- URM

They can then instantly generate personalized rankings depending on what they find the most important in a medical school. More importantly, users can **contribute their weights** (with optional demographic and academic context) to contribute to a **live, aggregated "Official Ranking** that evolves with community input.

By combining real data with real user priorities, we aim to create the most credible, representatice, and useful medical school rankings system available.

## Website
https://www.medicalschoolrankings.org/

## ERD
<img width="1542" height="836" alt="drawSQL-image-export-2025-11-05" src="https://github.com/user-attachments/assets/616e8e74-89f4-45fe-9b7f-1768edee94b3" />

## System Design
<img width="1410" height="584" alt="Blank diagram (3)" src="https://github.com/user-attachments/assets/dd627a27-3746-4a92-bf12-0ddfaeb63831" />
