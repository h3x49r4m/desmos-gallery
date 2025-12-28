#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

class GitHubPagesBuilder {
    constructor() {
        this.rootDir = __dirname;
        this.publicDir = path.join(this.rootDir, '_public');
        this.staticDir = path.join(this.rootDir, 'static');
        this.dataDir = path.join(this.rootDir, 'data');
    }

    async build() {
        console.log('🚀 Building GitHub Pages static site...');
        
        try {
            // Clean and create _public directory
            await this.cleanPublicDir();
            await this.createPublicDir();
            
            // Copy static files
            await this.copyStaticFiles();
            
            // Copy data files
            await this.copyDataFiles();
            
            // Update HTML files for static deployment
            await this.updateHtmlFiles();
            
            // Update JavaScript for static deployment
            await this.updateJavaScriptFiles();
            
            // Create .nojekyll file
            await this.createNoJekyllFile();
            
            console.log('✅ GitHub Pages build completed successfully!');
            console.log('📁 Static site is ready in _public/ directory');
            console.log('🌐 You can now deploy _public/ to GitHub Pages');
            
        } catch (error) {
            console.error('❌ Build failed:', error.message);
            process.exit(1);
        }
    }

    async cleanPublicDir() {
        console.log('🧹 Cleaning _public directory...');
        try {
            // Check if directory exists
            const entries = await fs.readdir(this.publicDir, { withFileTypes: true });
            
            // Remove all files and directories except .git
            for (const entry of entries) {
                if (entry.name !== '.git') {
                    const entryPath = path.join(this.publicDir, entry.name);
                    if (entry.isDirectory()) {
                        await fs.rm(entryPath, { recursive: true });
                    } else {
                        await fs.unlink(entryPath);
                    }
                }
            }
            console.log('  ✓ Cleaned _public directory (preserved .git)');
        } catch (error) {
            // Directory doesn't exist, that's fine
            console.log('  ✓ _public directory does not exist yet');
        }
    }

    async createPublicDir() {
        console.log('📁 Creating _public directory...');
        await fs.mkdir(this.publicDir, { recursive: true });
    }

    async copyStaticFiles() {
        console.log('📋 Copying static files...');
        await this.copyDirectory(this.staticDir, this.publicDir);
    }

    async copyDataFiles() {
        console.log('💾 Copying data files...');
        const publicDataDir = path.join(this.publicDir, 'data');
        await fs.mkdir(publicDataDir, { recursive: true });
        
        // Copy graphs.json if it exists
        const graphsFile = path.join(this.dataDir, 'graphs.json');
        const publicGraphsFile = path.join(publicDataDir, 'graphs.json');
        
        try {
            await fs.copyFile(graphsFile, publicGraphsFile);
            
            // Check if the copied file is empty, and if so, add sample data
            const data = await fs.readFile(publicGraphsFile, 'utf8');
            const graphs = JSON.parse(data);
            
            if (!Array.isArray(graphs) || graphs.length === 0) {
                console.log('  ⚠️ graphs.json is empty, adding sample data...');
                const sampleGraphs = this.getSampleGraphs();
                await fs.writeFile(publicGraphsFile, JSON.stringify(sampleGraphs, null, 2));
                console.log(`  ✓ Added ${sampleGraphs.length} sample graphs`);
            } else {
                console.log(`  ✓ Copied graphs.json with ${graphs.length} graphs`);
            }
        } catch (error) {
            // Create graphs.json with sample data if it doesn't exist
            console.log('  ⚠️ graphs.json not found, creating with sample data...');
            const sampleGraphs = this.getSampleGraphs();
            await fs.writeFile(publicGraphsFile, JSON.stringify(sampleGraphs, null, 2));
            console.log(`  ✓ Created graphs.json with ${sampleGraphs.length} sample graphs`);
        }
    }

    async copyDirectory(src, dest) {
        const entries = await fs.readdir(src, { withFileTypes: true });
        
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
                await fs.mkdir(destPath, { recursive: true });
                await this.copyDirectory(srcPath, destPath);
            } else {
                await fs.copyFile(srcPath, destPath);
            }
        }
    }

    async updateHtmlFiles() {
        console.log('🔄 Updating HTML files for static deployment...');
        
        // Update index.html
        const indexPath = path.join(this.publicDir, 'index.html');
        let indexContent = await fs.readFile(indexPath, 'utf8');
        
        // Update navigation links to use relative paths
        indexContent = indexContent
            .replace(/href="\/"/g, 'href="index.html"')
            .replace(/href="\/gallery\.html"/g, 'href="gallery.html"');
            
        await fs.writeFile(indexPath, indexContent);
        console.log('  ✓ Updated index.html');
        
        // Update gallery.html
        const galleryPath = path.join(this.publicDir, 'gallery.html');
        let galleryContent = await fs.readFile(galleryPath, 'utf8');
        
        galleryContent = galleryContent
            .replace(/href="\/"/g, 'href="index.html"')
            .replace(/href="\/gallery\.html"/g, 'href="gallery.html"');
            
        await fs.writeFile(galleryPath, galleryContent);
        console.log('  ✓ Updated gallery.html');
    }

    async updateJavaScriptFiles() {
        console.log('🔄 Updating JavaScript files for static deployment...');
        
        // Update galleryManager.js to load from local data file
        const galleryManagerPath = path.join(this.publicDir, 'js', 'galleryManager.js');
        let galleryManagerContent = await fs.readFile(galleryManagerPath, 'utf8');
        
        // Replace API calls with local data loading
        galleryManagerContent = galleryManagerContent.replace(
            /const response = await fetch\('\/api\/graphs'\);/,
            "const response = await fetch('data/graphs.json');"
        );
        
        // Disable server-side operations (delete, update) for static deployment
        galleryManagerContent = galleryManagerContent.replace(
            /fetch\(`\/api\/graphs\/\$\{graphId\}`, \{ method: 'DELETE' \}\)/g,
            "Promise.reject(new Error('Delete operation not available in static deployment'))"
        );
        
        galleryManagerContent = galleryManagerContent.replace(
            /const response = await fetch\(`\/api\/graphs\/\$\{this\.currentEditingGraph\.id\}`,/g,
            "Promise.reject(new Error('Update operation not available in static deployment'))"
        );
        
        await fs.writeFile(galleryManagerPath, galleryManagerContent);
        console.log('  ✓ Updated galleryManager.js');
    }

    async createNoJekyllFile() {
        console.log('📄 Creating .nojekyll file...');
        await fs.writeFile(path.join(this.publicDir, '.nojekyll'), '');
    }

    getSampleGraphs() {
        const now = new Date().toISOString();
        return [
            {
                id: 'sample-1',
                title: 'Parabola',
                formula: 'y=x^2',
                type: '2D',
                author: 'Desmos Gallery',
                lineColor: '#2196F3',
                tags: ['parabola', 'quadratic', 'basic'],
                createdAt: now
            },
            {
                id: 'sample-2',
                title: 'Sine Wave',
                formula: 'y=\\sin(x)',
                type: '2D',
                author: 'Desmos Gallery',
                lineColor: '#4CAF50',
                tags: ['trigonometry', 'wave', 'periodic'],
                createdAt: now
            },
            {
                id: 'sample-3',
                title: 'Circle',
                formula: 'x^2+y^2=25',
                type: '2D',
                author: 'Desmos Gallery',
                lineColor: '#FF5722',
                tags: ['circle', 'conic', 'geometry'],
                createdAt: now
            },
            {
                id: 'sample-4',
                title: 'Exponential Growth',
                formula: 'y=e^x',
                type: '2D',
                author: 'Desmos Gallery',
                lineColor: '#9C27B0',
                tags: ['exponential', 'growth', 'function'],
                createdAt: now
            },
            {
                id: 'sample-5',
                title: '3D Surface',
                formula: 'z=\\sin(x)\\cos(y)',
                type: '3D',
                author: 'Desmos Gallery',
                lineColor: '#00BCD4',
                tags: ['3d', 'surface', 'trigonometry'],
                createdAt: now
            },
            {
                id: 'sample-6',
                title: 'Logarithmic',
                formula: 'y=\\ln(x)',
                type: '2D',
                author: 'Desmos Gallery',
                lineColor: '#FF9800',
                tags: ['logarithm', 'function', 'inverse'],
                createdAt: now
            },
            {
                id: 'sample-7',
                title: '3D Spiral',
                formula: 'x=\\cos(t), y=\\sin(t), z=t/10',
                type: '3D',
                author: 'Desmos Gallery',
                lineColor: '#795548',
                tags: ['3d', 'parametric', 'spiral'],
                createdAt: now
            },
            {
                id: 'sample-8',
                title: 'Cubic Function',
                formula: 'y=x^3-3x',
                type: '2D',
                author: 'Desmos Gallery',
                lineColor: '#607D8B',
                tags: ['cubic', 'polynomial', 'critical-points'],
                createdAt: now
            }
        ];
    }
}

// Run the builder
if (require.main === module) {
    const builder = new GitHubPagesBuilder();
    builder.build();
}

module.exports = GitHubPagesBuilder;