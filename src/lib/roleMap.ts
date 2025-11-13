// src/lib/roleMap.ts
export const ROLE_UI_TO_DB: Record<string, string> = {
  "Current US medical student":                         "med_student",
  "Prospective US medical student enrolled in 4-year degree program": "pre_med_4yr",
  "Student (other)":                                    "other_student",
  "Medical school faculty member":                      "faculty",
  "Physician (resident, attending, etc)":               "physician",
};

export const ROLE_DB_TO_UI: Record<string, string> = Object.fromEntries(
  Object.entries(ROLE_UI_TO_DB).map(([ui, db]) => [db, ui])
);