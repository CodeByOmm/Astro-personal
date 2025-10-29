#!/usr/bin/env node

/**
 * Local Verification Script for Obfuscated Build
 * This script helps verify obfuscation results locally
 */

import fs from 'fs';
import path from 'path';
import {
    fileURLToPath
} from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

class ObfuscationVerifier {
    constructor() {
        this.distPath = path.resolve(__dirname, '../dist');
        this.obfuscatedDistPath = path.resolve(__dirname, '../dist-obfuscated');
        this.mappingPath = path.resolve(__dirname, '../obfuscation-data/main.json');
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '📋';
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async verifyObfuscation() {
        console.log('🔍 Starting Obfuscation Verification\n');

        // 1. Check if obfuscated build exists
        if (!fs.existsSync(this.obfuscatedDistPath)) {
            this.log('Obfuscated build not found. Run npm run build:obfuscated first.', 'error');
            return false;
        }

        // 2. Check mapping file
        if (!fs.existsSync(this.mappingPath)) {
            this.log('Mapping file not found. Obfuscation may not have completed properly.', 'error');
            return false;
        }

        // 3. Load and display mappings
        const mappingData = JSON.parse(fs.readFileSync(this.mappingPath, 'utf8'));
        const classMapping = mappingData.classes || {};
        const mappingCount = Object.keys(classMapping).length;

        this.log(`Found ${mappingCount} class mappings`, 'success');

        // 4. Show sample mappings
        console.log('\n📊 Sample Class Mappings:');
        const sampleMappings = Object.entries(classMapping).slice(0, 10);
        sampleMappings.forEach(([original, obfuscated], index) => {
            console.log(`   ${index + 1}. "${original}" → "${obfuscated}"`);
        });

        // 5. Check CSS files for obfuscation
        console.log('\n🎨 CSS File Analysis:');
        const cssFiles = this.findFiles(this.obfuscatedDistPath, '.css');

        for (const cssFile of cssFiles) {
            const content = fs.readFileSync(cssFile, 'utf8');
            const hasObfuscatedClasses = this.checkForObfuscatedClasses(content, classMapping);
            const relativeFile = path.relative(this.obfuscatedDistPath, cssFile);

            if (hasObfuscatedClasses > 0) {
                this.log(`${relativeFile}: ${hasObfuscatedClasses} obfuscated classes found`, 'success');
            } else {
                this.log(`${relativeFile}: No obfuscated classes detected`, 'warning');
            }
        }

        // 6. Check JS files for obfuscation
        console.log('\n📜 JavaScript File Analysis:');
        const jsFiles = this.findFiles(this.obfuscatedDistPath, '.js');

        for (const jsFile of jsFiles) {
            const content = fs.readFileSync(jsFile, 'utf8');
            const hasObfuscatedClasses = this.checkForObfuscatedClasses(content, classMapping);
            const relativeFile = path.relative(this.obfuscatedDistPath, jsFile);

            if (hasObfuscatedClasses > 0) {
                this.log(`${relativeFile}: ${hasObfuscatedClasses} obfuscated classes found`, 'success');
            } else {
                this.log(`${relativeFile}: No obfuscated classes detected`, 'info');
            }
        }

        // 7. Compare file sizes
        console.log('\n📏 File Size Comparison:');
        await this.compareFileSizes();

        // 8. Security analysis
        console.log('\n🔒 Security Analysis:');
        await this.performSecurityAnalysis(classMapping);

        return true;
    }

    findFiles(directory, extension) {
        const files = [];

        function walkDir(dir) {
            const items = fs.readdirSync(dir);

            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    walkDir(fullPath);
                } else if (fullPath.endsWith(extension)) {
                    files.push(fullPath);
                }
            }
        }

        walkDir(directory);
        return files;
    }

    checkForObfuscatedClasses(content, classMapping) {
        let count = 0;
        Object.values(classMapping).forEach(obfuscatedClass => {
            const regex = new RegExp(`\\b${obfuscatedClass}\\b`, 'g');
            const matches = content.match(regex);
            if (matches) {
                count += matches.length;
            }
        });
        return count;
    }

    async compareFileSizes() {
        const originalCSSFiles = this.findFiles(this.distPath, '.css');
        const obfuscatedCSSFiles = this.findFiles(this.obfuscatedDistPath, '.css');

        for (let i = 0; i < Math.min(originalCSSFiles.length, obfuscatedCSSFiles.length); i++) {
            const originalStats = fs.statSync(originalCSSFiles[i]);
            const obfuscatedStats = fs.statSync(obfuscatedCSSFiles[i]);

            const originalSize = originalStats.size;
            const obfuscatedSize = obfuscatedStats.size;
            const difference = ((obfuscatedSize - originalSize) / originalSize * 100).toFixed(1);

            const fileName = path.basename(originalCSSFiles[i]);
            console.log(`   ${fileName}: ${originalSize}B → ${obfuscatedSize}B (${difference > 0 ? '+' : ''}${difference}%)`);
        }
    }

    async performSecurityAnalysis(classMapping) {
        const totalClasses = Object.keys(classMapping).length;
        const obfuscatedLength = Object.values(classMapping)[0] ? .length || 0;

        // Calculate obfuscation strength
        const possibleCombinations = Math.pow(36, obfuscatedLength); // Base36 (0-9, a-z)
        const collisionProbability = (totalClasses / possibleCombinations * 100).toFixed(4);

        console.log(`   Total classes obfuscated: ${totalClasses}`);
        console.log(`   Average obfuscated length: ${obfuscatedLength} characters`);
        console.log(`   Possible combinations: ${possibleCombinations.toLocaleString()}`);
        console.log(`   Collision probability: ${collisionProbability}%`);

        // Check for patterns that might be reverse-engineered
        const patterns = this.analyzePatterns(classMapping);
        if (patterns.length > 0) {
            this.log('Potential reverse-engineering patterns detected:', 'warning');
            patterns.forEach(pattern => console.log(`     - ${pattern}`));
        } else {
            this.log('No obvious reverse-engineering patterns detected', 'success');
        }
    }

    analyzePatterns(classMapping) {
        const patterns = [];
        const values = Object.values(classMapping);

        // Check for sequential patterns
        const sortedValues = values.sort();
        let sequentialCount = 0;
        for (let i = 1; i < sortedValues.length; i++) {
            if (sortedValues[i].charCodeAt(0) === sortedValues[i - 1].charCodeAt(0) + 1) {
                sequentialCount++;
            }
        }

        if (sequentialCount > values.length * 0.1) {
            patterns.push('Sequential character patterns detected');
        }

        // Check for common prefixes
        const prefixes = {};
        values.forEach(value => {
            if (value.length > 1) {
                const prefix = value.substring(0, 1);
                prefixes[prefix] = (prefixes[prefix] || 0) + 1;
            }
        });

        const maxPrefixUsage = Math.max(...Object.values(prefixes));
        if (maxPrefixUsage > values.length * 0.5) {
            patterns.push('High prefix repetition detected');
        }

        return patterns;
    }

    async generateVerificationReport() {
        const reportPath = path.resolve(__dirname, '../obfuscation-verification-report.md');
        const mappingData = JSON.parse(fs.readFileSync(this.mappingPath, 'utf8'));

        const report = `# Obfuscation Verification Report

Generated: ${new Date().toISOString()}

## Summary
- **Total Classes Obfuscated**: ${Object.keys(mappingData.classes).length}
- **Obfuscation Method**: Random Base36 strings
- **Build Date**: ${mappingData.timestamp || 'Unknown'}

## Sample Mappings
${Object.entries(mappingData.classes).slice(0, 20).map(([orig, obf]) => `- \`${orig}\` → \`${obf}\``).join('\n')}

## Files Processed
### CSS Files
${this.findFiles(this.obfuscatedDistPath, '.css').map(file => `- ${path.relative(this.obfuscatedDistPath, file)}`).join('\n')}

### JavaScript Files  
${this.findFiles(this.obfuscatedDistPath, '.js').map(file => `- ${path.relative(this.obfuscatedDistPath, file)}`).join('\n')}

## Security Notes
- Class names are obfuscated, not encrypted
- Original functionality is preserved
- Framework classes are protected from obfuscation
- Mapping file should be kept private

## Next Steps
1. Deploy the \`dist-obfuscated\` folder to production
2. Keep the \`obfuscation-data\` folder private
3. Verify functionality on the live site
4. Monitor for any styling issues

---
*This report was generated automatically by the obfuscation verification script.*
`;

        fs.writeFileSync(reportPath, report);
        this.log(`Verification report saved to: ${reportPath}`, 'success');
    }
}

// Run verification
const verifier = new ObfuscationVerifier();
verifier.verifyObfuscation().then(success => {
    if (success) {
        console.log('\n📄 Generating detailed report...');
        return verifier.generateVerificationReport();
    }
}).then(() => {
    console.log('\n🎉 Verification completed successfully!');
}).catch(error => {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
});