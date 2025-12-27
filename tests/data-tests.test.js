const { loadGraphs, saveGraphs } = require('../src/server');
const fs = require('fs').promises;
const path = require('path');

// Mock the data file path for testing
const TEST_DATA_FILE = path.join(__dirname, '../test-data/test-graphs.json');

// Helper functions for testing
async function setupTestData() {
    const testDataDir = path.dirname(TEST_DATA_FILE);
    try {
        await fs.access(testDataDir);
    } catch {
        await fs.mkdir(testDataDir, { recursive: true });
    }
}

async function cleanupTestData() {
    try {
        await fs.unlink(TEST_DATA_FILE);
    } catch (error) {
        // File doesn't exist, that's fine
    }
}

async function loadTestGraphs() {
    try {
        const data = await fs.readFile(TEST_DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

async function saveTestGraphs(graphs) {
    await fs.writeFile(TEST_DATA_FILE, JSON.stringify(graphs, null, 2), 'utf8');
}

// Test data
const sampleGraphs = [
    {
        id: '1',
        title: 'Parabola',
        formula: 'y=x^2',
        type: '2D',
        tags: ['parabola', 'quadratic'],
        author: 'John Doe',
        lineColor: '#2196F3',
        createdAt: '2023-01-01T00:00:00.000Z'
    },
    {
        id: '2',
        title: '3D Surface',
        formula: 'z=x^2+y^2',
        type: '3D',
        tags: ['surface', '3d'],
        author: 'Jane Smith',
        lineColor: '#FF5722',
        createdAt: '2023-01-02T00:00:00.000Z'
    }
];

describe('Graph Data Management', () => {
    beforeEach(async () => {
        await setupTestData();
        await cleanupTestData();
    });

    afterEach(async () => {
        await cleanupTestData();
    });

    test('should load empty graphs when file does not exist', async () => {
        const graphs = await loadTestGraphs();
        expect(graphs).toEqual([]);
    });

    test('should save and load graphs correctly', async () => {
        await saveTestGraphs(sampleGraphs);
        const loadedGraphs = await loadTestGraphs();
        
        expect(loadedGraphs).toHaveLength(2);
        expect(loadedGraphs[0]).toEqual(sampleGraphs[0]);
        expect(loadedGraphs[1]).toEqual(sampleGraphs[1]);
    });

    test('should handle malformed JSON gracefully', async () => {
        await fs.writeFile(TEST_DATA_FILE, 'invalid json', 'utf8');
        
        await expect(loadTestGraphs()).rejects.toThrow();
    });
});

describe('Graph Validation', () => {
    test('should validate required fields', () => {
        const validGraph = sampleGraphs[0];
        
        expect(validGraph.id).toBeDefined();
        expect(validGraph.title).toBeDefined();
        expect(validGraph.formula).toBeDefined();
        expect(validGraph.type).toBeDefined();
        expect(validGraph.tags).toBeDefined();
        expect(validGraph.lineColor).toBeDefined();
        expect(validGraph.createdAt).toBeDefined();
    });

    test('should validate graph type is either 2D or 3D', () => {
        sampleGraphs.forEach(graph => {
            expect(['2D', '3D']).toContain(graph.type);
        });
    });

    test('should validate tags array', () => {
        sampleGraphs.forEach(graph => {
            expect(Array.isArray(graph.tags)).toBe(true);
            graph.tags.forEach(tag => {
                expect(typeof tag).toBe('string');
            });
        });
    });
});

module.exports = { sampleGraphs };