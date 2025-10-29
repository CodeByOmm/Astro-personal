/**
 * Build Configuration for Class Name Obfuscation
 * This file contains all configuration needed for the obfuscation process
 */

import path from 'path';
import {
    fileURLToPath
} from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const buildConfig = {
    // Obfuscation settings
    obfuscation: {
        enable: true,
        length: 6,
        classMethod: 'random',
        classPrefix: '',
        classSuffix: '',
        classIgnore: [
            // Framework and component classes that should not be obfuscated
            'astro-code',
            'astro-island',
            'flyonui',
            'btn',
            'card',
            'modal',
            'navbar',
            'dropdown',
            'tooltip',
            'hero',
            'container',
            // Theme classes
            'dark',
            'light',
            'theme-*',
            // Icon classes
            'icon',
            'iconify',
            'i-*',
            // Animation classes that might be referenced in JS
            'animate-*',
            'transition-*',
            // Screen reader and accessibility classes
            'sr-only',
            'not-sr-only',
            // Print classes
            'print:*'
        ],
        ids: false, // Safer to keep IDs unobfuscated
        idIgnore: [
            'home',
            'navigation',
            'header',
            'main',
            'footer'
        ],
        // Paths
        jsonDataPath: path.resolve(__dirname, 'obfuscation-data'),
        srcPath: path.resolve(__dirname, 'dist'),
        desPath: path.resolve(__dirname, 'dist-obfuscated'),
        extensions: ['.html', '.js'],
        htmlExcludes: [],
        cssExcludes: [],
        fresh: true,
        formatJson: true,
        keepData: true
    },

    // Build paths
    paths: {
        src: './src',
        dist: './dist',
        distObfuscated: './dist-obfuscated',
        obfuscationData: './obfuscation-data',
        coreObfuscator: '../core'
    },

    // Files to process
    filePatterns: {
        html: '**/*.html',
        js: '**/*.js',
        css: '**/*.css'
    }
};

export default buildConfig;