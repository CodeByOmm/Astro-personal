#!/usr/bin/env node

/**
 * Obfuscation Build Script for Astro Project
 * This script handles the complete obfuscation process after Astro build
 */

import fs from 'fs';
import path from 'path';
import {
    execSync
} from 'child_process';
import {
    fileURLToPath
} from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

class AstroObfuscator {
    constructor() {
        this.coreObfuscatorPath = path.resolve(__dirname, '../../core');
        this.distPath = path.resolve(__dirname, '../dist');
        this.obfuscatedDistPath = path.resolve(__dirname, '../dist-obfuscated');
        this.obfuscationDataPath = path.resolve(__dirname, '../obfuscation-data');

        this.config = {
            classIgnore: [
                'astro-code', 'astro-island', 'flyonui', 'btn', 'card', 'modal',
                'navbar', 'dropdown', 'tooltip', 'hero', 'container', 'dark', 'light',
                'theme-*', 'icon', 'iconify', 'i-*', 'animate-*', 'transition-*',
                'sr-only', 'not-sr-only', 'print:*'
            ]
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '📋';
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async cleanupPreviousBuild() {
        this.log('Cleaning up previous obfuscated build...');

        try {
            if (fs.existsSync(this.obfuscatedDistPath)) {
                fs.rmSync(this.obfuscatedDistPath, {
                    recursive: true,
                    force: true
                });
            }

            const obfuscationDataPath = path.resolve(__dirname, 'obfuscation-data');
            if (fs.existsSync(this.obfuscationDataPath)) {
                fs.rmSync(this.obfuscationDataPath, {
                    recursive: true,
                    force: true
                });
            }

            this.log('Cleanup completed', 'success');
        } catch (error) {
            this.log(`Cleanup error: ${error.message}`, 'error');
        }
    }

    async copyDistToObfuscated() {
        this.log('Copying dist folder for obfuscation...');

        try {
            // Copy the entire dist folder
            this.copyFolderSync(this.distPath, this.obfuscatedDistPath);
            this.log('Copy completed', 'success');
        } catch (error) {
            this.log(`Copy error: ${error.message}`, 'error');
            throw error;
        }
    }

    copyFolderSync(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, {
                recursive: true
            });
        }

        const files = fs.readdirSync(src);

        files.forEach(file => {
            const srcPath = path.join(src, file);
            const destPath = path.join(dest, file);

            if (fs.statSync(srcPath).isDirectory()) {
                this.copyFolderSync(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    }

    async obfuscateCSS() {
        this.log('Starting CSS obfuscation...');

        try {
            // Create a simple CSS processing script that uses the existing core obfuscator
            const tempScriptPath = path.join(this.coreObfuscatorPath, 'temp-astro-css-obfuscate.js');
            const tempScriptContent = `
        const fs = require('fs');
        const path = require('path');
        const glob = require('glob');
        
        // CSS obfuscation configuration
        const config = {
          enable: true,
          length: 6,
          classMethod: 'random',
          classIgnore: ${JSON.stringify(this.config.classIgnore)},
          jsonsPath: '${this.obfuscationDataPath}',
          srcPath: '${this.obfuscatedDistPath}',
          desPath: '${this.obfuscatedDistPath}',
          extensions: ['.html', '.js'],
          fresh: true,
          formatJson: true,
          keepData: true,
          showConfig: false
        };
        
        // Find all CSS files in the dist directory
        const cssFiles = glob.sync('**/*.css', { cwd: '${this.obfuscatedDistPath}' });
        
        console.log('Found CSS files:', cssFiles);
        
        // For now, we'll create a simple mapping and save it
        const classMapping = {};
        let counter = 1;
        
        // Process each CSS file to extract and map class names
        cssFiles.forEach(cssFile => {
          const fullPath = path.join('${this.obfuscatedDistPath}', cssFile);
          let content = fs.readFileSync(fullPath, 'utf8');
          
          // Simple regex to find class selectors
          const classMatches = content.match(/\\.[a-zA-Z][a-zA-Z0-9_-]*(?![a-zA-Z0-9_-])/g);
          
          if (classMatches) {
            classMatches.forEach(match => {
              const className = match.substring(1); // Remove the dot
              
              // Skip if already mapped or should be ignored
              if (!classMapping[className]) {
                const shouldIgnore = ${JSON.stringify(this.config.classIgnore)}.some(ignore => {
                  if (ignore.endsWith('*')) {
                    return className.startsWith(ignore.slice(0, -1));
                  }
                  return className === ignore;
                });
                
                if (!shouldIgnore) {
                  // Generate a simple obfuscated name
                  const obfuscated = 'a' + counter.toString(36);
                  classMapping[className] = obfuscated;
                  counter++;
                  
                  // Replace in CSS - simple string replacement for now
                  const searchPattern = '.' + className;
                  const replacePattern = '.' + obfuscated;
                  content = content.split(searchPattern).join(replacePattern);
                }
              }
            });
            
            fs.writeFileSync(fullPath, content);
            console.log('✅ Processed CSS file:', cssFile);
          }
        });
        
        // Save the mapping
        if (!fs.existsSync('${this.obfuscationDataPath}')) {
          fs.mkdirSync('${this.obfuscationDataPath}', { recursive: true });
        }
        
        const mappingData = {
          classes: classMapping,
          timestamp: new Date().toISOString(),
          totalClasses: Object.keys(classMapping).length
        };
        
        fs.writeFileSync(
          path.join('${this.obfuscationDataPath}', 'main.json'),
          JSON.stringify(mappingData, null, 2)
        );
        
        console.log('🎉 CSS obfuscation completed. Mapped', Object.keys(classMapping).length, 'classes');
      `;

            fs.writeFileSync(tempScriptPath, tempScriptContent);

            // Execute the CSS obfuscation
            execSync(`node "${tempScriptPath}"`, {
                stdio: 'inherit',
                cwd: this.coreObfuscatorPath
            });

            // Clean up temporary files
            fs.unlinkSync(tempScriptPath);

            this.log('CSS obfuscation completed', 'success');
        } catch (error) {
            this.log(`CSS obfuscation error: ${error.message}`, 'error');
            throw error;
        }
    }

    async obfuscateHTML() {
        this.log('Starting HTML obfuscation...');

        try {
            // Create HTML processing script
            const tempScriptPath = path.join(this.coreObfuscatorPath, 'temp-astro-html-obfuscate.js');
            const tempScriptContent = `
        const fs = require('fs');
        const path = require('path');
        const glob = require('glob');
        
        // Load the class mapping
        const mappingPath = path.join('${this.obfuscationDataPath}', 'main.json');
        
        if (!fs.existsSync(mappingPath)) {
          console.log('⚠️ No class mapping found, skipping HTML obfuscation');
          return;
        }
        
        const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
        const classMapping = mappingData.classes || {};
        
        console.log('Loading class mappings:', Object.keys(classMapping).length, 'mappings found');
        
        // Find all HTML files
        const htmlFiles = glob.sync('**/*.html', { cwd: '${this.obfuscatedDistPath}' });
        
        htmlFiles.forEach(htmlFile => {
          const fullPath = path.join('${this.obfuscatedDistPath}', htmlFile);
          let content = fs.readFileSync(fullPath, 'utf8');
          let changeCount = 0;
          
          // Replace class names in class attributes
          Object.entries(classMapping).forEach(([original, obfuscated]) => {
            // Match class="..." attributes and class='...' attributes
            const classRegex1 = new RegExp('class=["\\']([^"\\']*)\\\\b' + original + '\\\\b([^"\\']*)["\\']', 'g');
            const classRegex2 = new RegExp('class="([^"]*?)\\\\b' + original + '\\\\b([^"]*?)"', 'g');
            const classRegex3 = new RegExp("class='([^']*?)\\\\b" + original + "\\\\b([^']*?)'", 'g');
            
            const newContent1 = content.replace(classRegex1, (match, before, after) => {
              changeCount++;
              return 'class="' + (before + ' ' + obfuscated + ' ' + after).trim().replace(/\\s+/g, ' ') + '"';
            });
            
            const newContent2 = newContent1.replace(classRegex2, (match, before, after) => {
              changeCount++;
              return 'class="' + (before + ' ' + obfuscated + ' ' + after).trim().replace(/\\s+/g, ' ') + '"';
            });
            
            content = newContent2.replace(classRegex3, (match, before, after) => {
              changeCount++;
              return "class='" + (before + ' ' + obfuscated + ' ' + after).trim().replace(/\\s+/g, ' ') + "'";
            });
          });
          
          fs.writeFileSync(fullPath, content);
          console.log('✅ Processed HTML file:', htmlFile, '(' + changeCount + ' replacements)');
        });
        
        console.log('🎉 HTML obfuscation completed');
      `;

            fs.writeFileSync(tempScriptPath, tempScriptContent);

            // Execute HTML obfuscation
            execSync(`node "${tempScriptPath}"`, {
                stdio: 'inherit',
                cwd: this.coreObfuscatorPath
            });

            // Clean up
            fs.unlinkSync(tempScriptPath);

            this.log('HTML obfuscation completed', 'success');
        } catch (error) {
            this.log(`HTML obfuscation error: ${error.message}`, 'error');
            throw error;
        }
    }

    async obfuscateJavaScript() {
        this.log('Starting JavaScript obfuscation...');

        try {
            const tempScriptPath = path.join(this.coreObfuscatorPath, 'temp-astro-js-obfuscate.js');
            const tempScriptContent = `
        const fs = require('fs');
        const path = require('path');
        const glob = require('glob');
        
        // Load the class mapping
        const mappingPath = path.join('${this.obfuscationDataPath}', 'main.json');
        
        if (!fs.existsSync(mappingPath)) {
          console.log('⚠️ No class mapping found, skipping JS obfuscation');
          return;
        }
        
        const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
        const classMapping = mappingData.classes || {};
        
        console.log('Processing JS files with', Object.keys(classMapping).length, 'class mappings');
        
        // Find all JS files
        const jsFiles = glob.sync('**/*.js', { cwd: '${this.obfuscatedDistPath}' });
        
        jsFiles.forEach(jsFile => {
          const fullPath = path.join('${this.obfuscatedDistPath}', jsFile);
          let content = fs.readFileSync(fullPath, 'utf8');
          let changeCount = 0;
          
          // Replace class references in common JS patterns
          Object.entries(classMapping).forEach(([original, obfuscated]) => {
            // classList operations: classList.add('class-name')
            const classListRegex = new RegExp("(classList\\\\.(add|remove|toggle|contains)\\\\(\\\\s*['\\\"])(" + original + ")(['\\\"\\\\)])", 'g');
            content = content.replace(classListRegex, (match, prefix, method, className, suffix) => {
              if (className === original) {
                changeCount++;
                return prefix + obfuscated + suffix;
              }
              return match;
            });
            
            // querySelector: querySelector('.class-name')
            const querySelectorRegex = new RegExp("(querySelector(?:All)?\\\\(\\\\s*['\\\"]\\\\.)(" + original + ")(['\\\"\\\\)])", 'g');
            content = content.replace(querySelectorRegex, (match, prefix, className, suffix) => {
              if (className === original) {
                changeCount++;
                return prefix + obfuscated + suffix;
              }
              return match;
            });
            
            // className assignment: className = "class-name"
            const classNameRegex = new RegExp('(className\\\\s*=\\\\s*["\\\'])([^"\\\']*\\\\b)(' + original + ')(\\\\b[^"\\\']*["\\\'])', 'g');
            content = content.replace(classNameRegex, (match, prefix, before, className, after) => {
              if (className === original) {
                changeCount++;
                return prefix + before + obfuscated + after;
              }
              return match;
            });
          });
          
          if (changeCount > 0) {
            fs.writeFileSync(fullPath, content);
            console.log('✅ Processed JS file:', jsFile, '(' + changeCount + ' replacements)');
          }
        });
        
        console.log('🎉 JavaScript obfuscation completed');
      `;

            fs.writeFileSync(tempScriptPath, tempScriptContent);

            // Execute JS obfuscation
            execSync(`node "${tempScriptPath}"`, {
                stdio: 'inherit',
                cwd: this.coreObfuscatorPath
            });

            // Clean up
            fs.unlinkSync(tempScriptPath);

            this.log('JavaScript obfuscation completed', 'success');
        } catch (error) {
            this.log(`JavaScript obfuscation error: ${error.message}`, 'error');
            // JS obfuscation is optional, don't throw
        }
    }

    async generateReport() {
        this.log('Generating obfuscation report...');

        try {
            const mappingPath = path.join(this.obfuscationDataPath, 'main.json');

            if (fs.existsSync(mappingPath)) {
                const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
                const classCount = Object.keys(mapping.classes || mapping || {}).length;

                this.log(`Report: ${classCount} classes obfuscated`, 'success');
                this.log(`Mapping saved to: ${mappingPath}`, 'info');
                this.log(`Obfuscated files location: ${this.obfuscatedDistPath}`, 'info');

                // Show some example mappings
                const classes = mapping.classes || {};
                const exampleClasses = Object.entries(classes).slice(0, 5);
                if (exampleClasses.length > 0) {
                    this.log('Example mappings:', 'info');
                    exampleClasses.forEach(([original, obfuscated]) => {
                        console.log(`  ${original} → ${obfuscated}`);
                    });
                }
            } else {
                this.log('No mapping file found', 'error');
            }
        } catch (error) {
            this.log(`Report generation error: ${error.message}`, 'error');
        }
    }

    async run() {
        console.log('🚀 Starting Astro Obfuscation Process\n');

        try {
            await this.cleanupPreviousBuild();
            await this.copyDistToObfuscated();
            await this.obfuscateCSS();
            await this.obfuscateHTML();
            await this.obfuscateJavaScript();
            await this.generateReport();

            console.log('\n🎉 Obfuscation process completed successfully!');
            console.log(`📁 Deploy the contents of: ${this.obfuscatedDistPath}`);

        } catch (error) {
            console.log('\n❌ Obfuscation process failed:', error.message);
            process.exit(1);
        }
    }
}

// Run the obfuscator
const obfuscator = new AstroObfuscator();
obfuscator.run();

export default AstroObfuscator;