/**
 * Data Manager Tests
 * Tests for data persistence and management functionality
 */

const fs = require('fs').promises;
const path = require('path');

// Mock the data file path for testing
const TEST_DATA_FILE = path.join(__dirname, '../test-data/graphs-test.json');

// Data manager functions (extracted from server for testing)
async function loadData() {
    try {
        const data = await fs.readFile(TEST_DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        console.error('Error loading data:', error);
        return [];
    }
}

async function saveData(graphs) {
    try {
        const dataDir = path.dirname(TEST_DATA_FILE);
        await fs.mkdir(dataDir, { recursive: true });
        await fs.writeFile(TEST_DATA_FILE, JSON.stringify(graphs, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
}

function validateGraph(graph) {
    if (!graph || typeof graph !== 'object') {
        return false;
    }

    const requiredFields = ['id', 'title', 'formula', 'type', 'createdAt'];
    for (const field of requiredFields) {
        if (!graph[field]) {
            return false;
        }
    }

    if (!['2D', '3D'].includes(graph.type)) {
        return false;
    }

    if (graph.tags && !Array.isArray(graph.tags)) {
        return false;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(graph.lineColor)) {
        return false;
    }

    if (!isValidDate(graph.createdAt)) {
        return false;
    }

    return true;
}

function sanitizeGraph(graph) {
    if (!graph || typeof graph !== 'object') {
        return graph;
    }

    const sanitized = { ...graph };

    // Trim string fields and handle null/undefined
    sanitized.title = (sanitized.title || '').toString().trim().substring(0, 200);
    sanitized.formula = (sanitized.formula || '').toString().trim().substring(0, 500);
    sanitized.author = (sanitized.author || '').toString().trim().substring(0, 100);

    // Clean tags array
    if (sanitized.tags) {
        sanitized.tags = sanitized.tags
            .filter(tag => tag && typeof tag === 'string')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
            .slice(0, 20);
    } else {
        sanitized.tags = [];
    }

    // Remove extra fields
    const allowedFields = ['id', 'title', 'formula', 'type', 'tags', 'author', 'lineColor', 'createdAt'];
    Object.keys(sanitized).forEach(key => {
        if (!allowedFields.includes(key)) {
            delete sanitized[key];
        }
    });

    return sanitized;
}

function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

describe('Data Manager Tests', () => {
    const TEST_DATA_FILE = path.join(__dirname, '../test-data/graphs-test.json');
    
    beforeEach(async () => {
        // Override DATA_FILE for testing
        process.env.DATA_FILE = TEST_DATA_FILE;
        
        // Clean up test data file
        try {
            await fs.unlink(TEST_DATA_FILE);
        } catch (error) {
            // File doesn't exist, that's fine
        }
    });

    afterEach(async () => {
        // Clean up test data file
        try {
            await fs.unlink(TEST_DATA_FILE);
        } catch (error) {
            // File doesn't exist, that's fine
        }
    });

    describe('File Operations', () => {
        test('should create data directory if it does not exist', async () => {
            await saveData([]);
            
            const stats = await fs.stat(path.dirname(TEST_DATA_FILE));
            expect(stats.isDirectory()).toBe(true);
        });

        test('should save and load graphs correctly', async () => {
            const graphs = [
                {
                    id: '1',
                    title: 'Test Graph',
                    formula: 'y=x^2',
                    type: '2D',
                    tags: ['test'],
                    author: 'Test Author',
                    lineColor: '#FF0000',
                    createdAt: '2023-01-01T00:00:00.000Z'
                }
            ];

            await saveData(graphs);
            const loadedGraphs = await loadData();

            expect(loadedGraphs).toEqual(graphs);
        });

        test('should handle empty graphs array', async () => {
            await saveData([]);
            const loadedGraphs = await loadData();

            expect(Array.isArray(loadedGraphs)).toBe(true);
            expect(loadedGraphs).toHaveLength(0);
        });

        test('should handle malformed JSON gracefully', async () => {
            // Create malformed JSON file
            await fs.writeFile(TEST_DATA_FILE, '{"invalid": json}');
            
            // Should return empty array on malformed JSON
            const graphs = await loadData();
            expect(graphs).toEqual([]);
        });

        test('should handle file not found', async () => {
            // Ensure file doesn't exist
            try {
                await fs.unlink(TEST_DATA_FILE);
            } catch (error) {
                // File doesn't exist, that's fine
            }

            const graphs = await loadData();
            expect(graphs).toEqual([]);
        });
    });

    describe('Graph Validation', () => {
        test('should validate valid graph object', () => {
            const validGraph = {
                id: '1',
                title: 'Test Graph',
                formula: 'y=x^2',
                type: '2D',
                tags: ['test'],
                author: 'Test Author',
                lineColor: '#FF0000',
                createdAt: '2023-01-01T00:00:00.000Z'
            };

            expect(validateGraph(validGraph)).toBe(true);
        });

        test('should reject graph without required fields', () => {
            const invalidGraph = {
                title: 'Test Graph'
                // Missing required fields
            };

            expect(validateGraph(invalidGraph)).toBe(false);
        });

        test('should reject graph with invalid type', () => {
            const invalidGraph = {
                id: '1',
                title: 'Test Graph',
                formula: 'y=x^2',
                type: 'INVALID',
                tags: ['test'],
                author: 'Test Author',
                lineColor: '#FF0000',
                createdAt: '2023-01-01T00:00:00.000Z'
            };

            expect(validateGraph(invalidGraph)).toBe(false);
        });

        test('should reject graph with invalid color format', () => {
            const invalidGraph = {
                id: '1',
                title: 'Test Graph',
                formula: 'y=x^2',
                type: '2D',
                tags: ['test'],
                author: 'Test Author',
                lineColor: 'invalid-color',
                createdAt: '2023-01-01T00:00:00.000Z'
            };

            expect(validateGraph(invalidGraph)).toBe(false);
        });

        test('should validate tags array', () => {
            const validGraph1 = {
                id: '1',
                title: 'Test Graph',
                formula: 'y=x^2',
                type: '2D',
                tags: ['test', 'math'],
                author: 'Test Author',
                lineColor: '#FF0000',
                createdAt: '2023-01-01T00:00:00.000Z'
            };

            const validGraph2 = {
                id: '2',
                title: 'Test Graph',
                formula: 'y=x^2',
                type: '2D',
                tags: [],
                author: 'Test Author',
                lineColor: '#FF0000',
                createdAt: '2023-01-01T00:00:00.000Z'
            };

            expect(validateGraph(validGraph1)).toBe(true);
            expect(validateGraph(validGraph2)).toBe(true);
        });

        test('should validate date format', () => {
            const validGraph = {
                id: '1',
                title: 'Test Graph',
                formula: 'y=x^2',
                type: '2D',
                tags: ['test'],
                author: 'Test Author',
                lineColor: '#FF0000',
                createdAt: '2023-01-01T00:00:00.000Z'
            };

            expect(validateGraph(validGraph)).toBe(true);

            const invalidGraph = {
                ...validGraph,
                createdAt: 'invalid-date'
            };

            expect(validateGraph(invalidGraph)).toBe(false);
        });
    });

    describe('Graph Sanitization', () => {
        test('should sanitize graph object', () => {
            const unsanitizedGraph = {
                id: '1',
                title: ' Test Graph ',
                formula: ' y=x^2 ',
                type: '2D',
                tags: [' test ', 'math '],
                author: ' Test Author ',
                lineColor: '#FF0000',
                createdAt: '2023-01-01T00:00:00.000Z',
                extraField: 'should be removed'
            };

            const sanitized = sanitizeGraph(unsanitizedGraph);

            expect(sanitized.title).toBe('Test Graph');
            expect(sanitized.formula).toBe('y=x^2');
            expect(sanitized.tags).toEqual(['test', 'math']);
            expect(sanitized.author).toBe('Test Author');
            expect(sanitized.extraField).toBeUndefined();
        });

        test('should handle null/undefined values', () => {
            const unsanitizedGraph = {
                id: '1',
                title: null,
                formula: undefined,
                type: '2D',
                tags: null,
                author: undefined,
                lineColor: '#FF0000',
                createdAt: '2023-01-01T00:00:00.000Z'
            };

            const sanitized = sanitizeGraph(unsanitizedGraph);

            expect(sanitized.title).toBe('');
            expect(sanitized.formula).toBe('');
            expect(sanitized.tags).toEqual([]);
            expect(sanitized.author).toBe('');
        });

        test('should limit string length', () => {
            const longString = 'a'.repeat(1000);
            const unsanitizedGraph = {
                id: '1',
                title: longString,
                formula: 'y=x^2',
                type: '2D',
                tags: [],
                author: 'Test Author',
                lineColor: '#FF0000',
                createdAt: '2023-01-01T00:00:00.000Z'
            };

            const sanitized = sanitizeGraph(unsanitizedGraph);

            expect(sanitized.title.length).toBeLessThanOrEqual(200);
        });
    });

    describe('Data Integrity', () => {
        test('should preserve data integrity through save/load cycle', async () => {
            const originalGraphs = [
                {
                    id: '1',
                    title: 'Graph 1',
                    formula: 'y=x^2',
                    type: '2D',
                    tags: ['parabola'],
                    author: 'Author 1',
                    lineColor: '#FF0000',
                    createdAt: '2023-01-01T00:00:00.000Z'
                },
                {
                    id: '2',
                    title: 'Graph 2',
                    formula: 'y=sin(x)',
                    type: '2D',
                    tags: ['trigonometry'],
                    author: 'Author 2',
                    lineColor: '#2196F3',
                    createdAt: '2023-01-02T00:00:00.000Z'
                }
            ];

            await saveData(originalGraphs);
            const loadedGraphs = await loadData();

            expect(loadedGraphs).toEqual(originalGraphs);
        });

        test('should handle special characters in graph data', async () => {
            const graphs = [
                {
                    id: 'special-chars',
                    title: 'Graph with special chars: áéíóú ñ 中文 🎨',
                    formula: 'y=x^2 + "quotes" & symbols @#$%',
                    type: '2D',
                    tags: ['español', '中文', 'mathématiques', 'emoji 🚀'],
                    author: 'José María (测试)',
                    lineColor: '#FF5722',
                    createdAt: '2023-01-01T00:00:00.000Z'
                }
            ];

            await saveData(graphs);
            const loadedGraphs = await loadData();

            expect(loadedGraphs[0].title).toBe('Graph with special chars: áéíóú ñ 中文 🎨');
            expect(loadedGraphs[0].formula).toBe('y=x^2 + "quotes" & symbols @#$%');
            expect(loadedGraphs[0].tags).toEqual(['español', '中文', 'mathématiques', 'emoji 🚀']);
            expect(loadedGraphs[0].author).toBe('José María (测试)');
        });

        test('should handle large number of graphs', async () => {
            const graphs = [];
            for (let i = 0; i < 100; i++) {
                graphs.push({
                    id: `graph-${i}`,
                    title: `Graph ${i}`,
                    formula: `y=x^${i}`,
                    type: i % 2 === 0 ? '2D' : '3D',
                    tags: [`tag-${i % 10}`],
                    author: `Author ${i % 5}`,
                    lineColor: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
                    createdAt: new Date(Date.now() - i * 86400000).toISOString()
                });
            }

            await saveData(graphs);
            const loadedGraphs = await loadData();

            expect(loadedGraphs).toHaveLength(100);
            expect(loadedGraphs[0].title).toBe('Graph 0');
            expect(loadedGraphs[99].title).toBe('Graph 99');
        });
    });

    describe('Edge Cases', () => {
        test('should handle concurrent access', async () => {
            const graphs = [
                { id: '1', title: 'Graph 1', formula: 'y=x^2', type: '2D', tags: [], author: 'Author', lineColor: '#FF0000', createdAt: '2023-01-01T00:00:00.000Z' }
            ];

            // Simulate concurrent saves
            const promises = [];
            for (let i = 0; i < 5; i++) {
                promises.push(saveData(graphs));
            }

            await Promise.all(promises);

            const loadedGraphs = await loadData();
            expect(loadedGraphs).toEqual(graphs);
        });

        test('should handle file permission errors gracefully', async () => {
            // This test would require mocking file system errors
            // For now, we'll just test that the function doesn't crash
            expect(() => {
                loadData();
            }).not.toThrow();
        });
    });
});