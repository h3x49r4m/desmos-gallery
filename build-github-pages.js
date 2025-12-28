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
            await fs.rm(this.publicDir, { recursive: true });
        } catch (error) {
            // Directory doesn't exist, that's fine
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
        try {
            await fs.copyFile(graphsFile, path.join(publicDataDir, 'graphs.json'));
            console.log('  ✓ Copied graphs.json');
        } catch (error) {
            // Create empty graphs.json if it doesn't exist
            await fs.writeFile(path.join(publicDataDir, 'graphs.json'), '[]');
            console.log('  ✓ Created empty graphs.json');
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
}

// Run the builder
if (require.main === module) {
    const builder = new GitHubPagesBuilder();
    builder.build();
}

module.exports = GitHubPagesBuilder;