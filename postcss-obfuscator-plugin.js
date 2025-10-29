/**
 * PostCSS Obfuscator Plugin for Astro
 * Integrates with existing obfuscation system in core directory
 */

const path = require('path');
const fs = require('fs');

// Import existing obfuscator
const obfuscatorPath = path.resolve(__dirname, '../core/obfuscator/obfuscate.js');
const obfuscator = require(obfuscatorPath);

const plugin = (opts = {}) => {
    const options = {
        enable: process.env.NODE_ENV === 'production', // Only obfuscate in production
        length: 6, // Random name length
        classMethod: 'random', // Use random method for better obfuscation
        classPrefix: '',
        classSuffix: '',
        classIgnore: [
            // Ignore important framework classes
            'astro-*', // Astro specific classes
            'flyonui-*', // FlyonUI component classes
            'icon', // Icon classes
            'iconify', // Iconify classes
            'dark', 'light', // Theme classes
            // Add any other critical classes that shouldn't be obfuscated
        ],
        ids: false, // Don't obfuscate IDs for now to avoid breaking functionality
        idMethod: 'random',
        idIgnore: ['home', 'navigation'], // Keep important navigation IDs
        jsonsPath: path.resolve(__dirname, 'obfuscation-data'),
        srcPath: path.resolve(__dirname, 'dist'),
        desPath: path.resolve(__dirname, 'dist-obfuscated'),
        extensions: ['.html', '.js', '.astro'],
        fresh: true, // Create fresh obfuscation data for each build
        formatJson: true,
        showConfig: false,
        keepData: true,
        ...opts
    };

    return {
        postcssPlugin: 'postcss-obfuscator-astro',
        plugins: [
            // Apply obfuscation during PostCSS processing
            obfuscator(options)
        ]
    };
};

plugin.postcss = true;

module.exports = plugin;