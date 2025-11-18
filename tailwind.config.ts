// tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Config = {
  // CRITICAL: This array must include all paths where you use Tailwind classes.
  content: [
    // Scans pages/components/app folders inside src for Tailwind classes
    './src/**/*.{js,ts,jsx,tsx,mdx}', 
  ],
  theme: {
    extend: {
      // Since you are trying to match the exact look of the HTML, 
      // we don't need extensions for now, but this structure is correct.
    },
  },
  plugins: [],
};
export default config;