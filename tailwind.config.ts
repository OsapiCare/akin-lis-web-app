import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
  		colors: {
  			'akin-cosmic-latte': '##fffcf7',
  			'akin-turquoise': '#0080a7',
  			'akin-white-smoke': '#f5f5f5',
  			'akin-yellow-light': '#f7ebd2',
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		animation: {
			spin: "spin 1s linear infinite",
			"spin-slow": "spin 10s linear infinite",
			"spin-fast": "spin 0.5s linear infinite",
		},
		keyframes: {
  			spin: {
  				from: {
  					transform: 'rotate(0deg)',
  				},
  				to: {
  					transform: 'rotate(360deg)',
  				},
  			},
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
