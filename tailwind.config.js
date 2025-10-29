import flyonui from 'flyonui';
import {
    addDynamicIconSelectors
} from '@iconify/tailwind4';
import tailwindcssIntersect from 'tailwindcss-intersect';
import tailwindcssMotion from 'tailwindcss-motion';

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto'],
                'public-sans': ['Public Sans', 'ui-sans-serif', 'system-ui'],
                'archivo': ['Archivo', 'ui-sans-serif', 'system-ui'],
                'rubik': ['Rubik', 'ui-sans-serif', 'system-ui'],
                'montserrat': ['Montserrat', 'ui-sans-serif', 'system-ui'],
                'fira-code': ['Fira Code', 'ui-monospace', 'monospace']
            }
        }
    },
    plugins: [
        addDynamicIconSelectors(),
        flyonui({
            themes: [
                'light',
                'dark',
                {
                    name: 'corporate',
                    fontFamily: 'Public Sans'
                },
                {
                    name: 'luxury',
                    fontFamily: 'Archivo'
                },
                {
                    name: 'gourmet',
                    fontFamily: 'Rubik'
                },
                {
                    name: 'soft',
                    fontFamily: 'Montserrat'
                },
                {
                    name: 'vscode',
                    fontFamily: 'Fira Code'
                }
            ]
        }),
        tailwindcssIntersect,
        tailwindcssMotion
    ]
};