import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
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
  		typography: {
  			DEFAULT: {
  				css: {
  					maxWidth: 'none',
  					width: '100%',
  					color: 'hsl(var(--foreground))',
  					p: {
  						fontSize: '1.125rem',
  						lineHeight: '1.75',
  						marginTop: '1.25em',
  						marginBottom: '1.25em'
  					},
  					h1: {
  						fontSize: '2.25rem',
  						lineHeight: '1.25',
  						fontWeight: '600',
  						marginTop: '0',
  						marginBottom: '1em'
  					},
  					h2: {
  						fontSize: '1.875rem',
  						lineHeight: '1.3',
  						fontWeight: '600',
  						marginTop: '1.5em',
  						marginBottom: '0.75em'
  					},
  					h3: {
  						fontSize: '1.5rem',
  						lineHeight: '1.3',
  						fontWeight: '600',
  						marginTop: '1.5em',
  						marginBottom: '0.75em'
  					},
  					a: {
  						color: 'hsl(var(--primary))',
  						textDecoration: 'none',
  						'&:hover': {
  							color: 'hsl(var(--primary))',
  							textDecoration: 'underline'
  						}
  					},
  					li: {
  						marginTop: '0.5em',
  						marginBottom: '0.5em',
  						fontSize: '1.125rem'
  					},
  					'ul, ol': {
  						marginTop: '1.25em',
  						marginBottom: '1.25em',
  						paddingLeft: '1.25em'
  					},
  					img: {
  						marginTop: '2em',
  						marginBottom: '2em',
  						borderRadius: '0.5rem'
  					},
  					'code::before': {
  						content: '"'
  					},
  					'code::after': {
  						content: '"'
  					}
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"), // Added typography plugin here
  ],
} satisfies Config

export default config