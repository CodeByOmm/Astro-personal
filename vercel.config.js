/**
 * Vercel Deployment Configuration
 * This file contains configuration for deploying obfuscated builds to Vercel
 */

module.exports = {
    // Vercel build configuration
    vercel: {
        // Use the obfuscated dist folder for deployment
        buildCommand: "npm run build:production",
        outputDirectory: "dist-obfuscated",
        installCommand: "npm install",

        // Environment variables for production builds
        env: {
            NODE_ENV: "production",
            OBFUSCATE_BUILD: "true"
        }
    },

    // Development vs Production settings
    development: {
        obfuscation: false,
        buildCommand: "npm run build"
    },

    production: {
        obfuscation: true,
        buildCommand: "npm run build:production"
    }
};