/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: {
				'xs': '320px',
				'sm': '375px',
				'md': '428px',
				'lg': '768px',
			},
		},
		extend: {
			colors: {
				// Primary system - Electric blue
				primary: {
					50: '#E6F0FF',
					100: '#CCE0FF',
					500: '#0066FF',
					600: '#0052CC',
					900: '#003D99',
					DEFAULT: '#0066FF',
					foreground: '#FFFFFF',
				},
				// Neutral system
				neutral: {
					50: '#FAFAFA',
					100: '#F5F5F5',
					200: '#E5E5E5',
					500: '#737373',
					700: '#404040',
					900: '#171717',
				},
				// Semantic colors for price states
				semantic: {
					success: '#10B981',
					successBg: '#D1FAE5',
					warning: '#F59E0B',
					warningBg: '#FEF3C7',
					danger: '#EF4444',
					dangerBg: '#FEE2E2',
				},
				// Background system
				background: {
					primary: '#FAFAFA',
					surface: '#FFFFFF',
					DEFAULT: '#FAFAFA',
					foreground: '#171717',
				},
				// Standard system compatibility
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				foreground: 'hsl(var(--foreground))',
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
			},
			fontFamily: {
				sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
			},
			fontSize: {
				hero: ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
				title: ['24px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
				subtitle: ['18px', { lineHeight: '1.3' }],
				body: ['16px', { lineHeight: '1.5' }],
				'body-sm': ['14px', { lineHeight: '1.5' }],
				caption: ['12px', { lineHeight: '1.4', letterSpacing: '0.01em' }],
			},
			fontWeight: {
				regular: '400',
				medium: '500',
				semibold: '600',
				bold: '700',
			},
			spacing: {
				xs: '4px',
				sm: '8px',
				md: '16px',
				lg: '24px',
				xl: '32px',
				'2xl': '48px',
				'3xl': '64px',
			},
			borderRadius: {
				sm: '8px',
				md: '12px',
				lg: '16px',
				xl: '24px',
				full: '9999px',
				DEFAULT: '12px',
			},
			boxShadow: {
				sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
				card: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
				'card-hover': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
				modal: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
			},
			animation: {
				fast: '150ms ease-out',
				normal: '250ms ease-out',
				slow: '350ms ease-out',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
			transitionTimingFunction: {
				default: 'ease-out',
				smooth: 'ease-in-out',
			},
			breakpoints: {
				xs: '320px',
				sm: '375px',
				md: '428px',
				lg: '768px',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}