const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, '../data/graphs.json');

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false
}));
app.use(express.json({ 
    limit: '10mb',
    strict: false
}));
app.use(express.urlencoded({ extended: true }));

// JSON parsing error handler
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ 
            error: 'Invalid JSON format',
            message: 'The request body contains invalid JSON'
        });
    }
    next();
});

// Ensure data directory exists
async function ensureDataDir() {
    const dataDir = path.dirname(DATA_FILE);
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Load graphs from JSON file
async function loadGraphs() {
    try {
        await ensureDataDir();
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, return empty array
            return [];
        }
        throw error;
    }
}

// Save graphs to JSON file
async function saveGraphs(graphs) {
    await ensureDataDir();
    await fs.writeFile(DATA_FILE, JSON.stringify(graphs, null, 2), 'utf8');
}

// Proxy Desmos API scripts to avoid CORS issues
app.get('/api/v1.12/calculator.js', (req, res) => {
    const url = `https://www.desmos.com/api/v1.12/calculator.js`;
    
    https.get(url, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.send(data);
        });
    }).on('error', (err) => {
        console.error('Error loading Desmos API:', err);
        res.status(500).send('Error loading Desmos API');
    });
});

app.get('/api/v1.12/calculator3d.js', (req, res) => {
    const url = `https://www.desmos.com/api/v1.12/calculator3d.js`;
    
    https.get(url, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.send(data);
        });
    }).on('error', (err) => {
        console.error('Error loading Desmos 3D API:', err);
        res.status(500).send('Error loading Desmos 3D API');
    });
});

// API Routes

// GET all graphs
app.get('/api/graphs', async (req, res) => {
    try {
        const graphs = await loadGraphs();
        res.json(graphs);
    } catch (error) {
        console.error('Error loading graphs:', error);
        res.status(500).json({ error: 'Failed to load graphs' });
    }
});

// POST new graph
app.post('/api/graphs', async (req, res) => {
    try {
        // Validate required fields
        const { title, formula, type } = req.body;
        
        if (!title || !formula || !type) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                message: 'Title, formula, and type are required'
            });
        }
        
        if (!['2D', '3D'].includes(type)) {
            return res.status(400).json({ 
                error: 'Invalid graph type',
                message: 'Type must be either 2D or 3D'
            });
        }
        
        const graphs = await loadGraphs();
        const newGraph = {
            ...req.body,
            id: req.body.id || Date.now().toString(),
            createdAt: req.body.createdAt || new Date().toISOString()
        };
        
        graphs.push(newGraph);
        await saveGraphs(graphs);
        
        res.status(201).json(newGraph);
    } catch (error) {
        console.error('Error saving graph:', error);
        res.status(500).json({ error: 'Failed to save graph' });
    }
});

// GET specific graph by ID
app.get('/api/graphs/:id', async (req, res) => {
    try {
        const graphs = await loadGraphs();
        const graph = graphs.find(g => g.id === req.params.id);
        
        if (!graph) {
            return res.status(404).json({ error: 'Graph not found' });
        }
        
        res.json(graph);
    } catch (error) {
        console.error('Error loading graph:', error);
        res.status(500).json({ error: 'Failed to load graph' });
    }
});

// PUT update graph by ID
app.put('/api/graphs/:id', async (req, res) => {
    try {
        const graphs = await loadGraphs();
        const index = graphs.findIndex(g => g.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Graph not found' });
        }
        
        graphs[index] = { ...graphs[index], ...req.body };
        await saveGraphs(graphs);
        
        res.json(graphs[index]);
    } catch (error) {
        console.error('Error updating graph:', error);
        res.status(500).json({ error: 'Failed to update graph' });
    }
});

// DELETE graph by ID
app.delete('/api/graphs/:id', async (req, res) => {
    try {
        const graphs = await loadGraphs();
        const index = graphs.findIndex(g => g.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Graph not found' });
        }
        
        const deletedGraph = graphs.splice(index, 1)[0];
        await saveGraphs(graphs);
        
        res.json(deletedGraph);
    } catch (error) {
        console.error('Error deleting graph:', error);
        res.status(500).json({ error: 'Failed to delete graph' });
    }
});

// GET all unique tags
app.get('/api/tags', async (req, res) => {
    try {
        const graphs = await loadGraphs();
        const allTags = new Set();
        
        graphs.forEach(graph => {
            graph.tags.forEach(tag => allTags.add(tag));
        });
        
        res.json(Array.from(allTags).sort());
    } catch (error) {
        console.error('Error loading tags:', error);
        res.status(500).json({ error: 'Failed to load tags' });
    }
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server only if this file is run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Desmos Gallery server running at http://localhost:${PORT}`);
        console.log(`Data storage: ${DATA_FILE}`);
    });
}

module.exports = { app, loadGraphs, saveGraphs };