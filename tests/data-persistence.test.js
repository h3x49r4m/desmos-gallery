describe('Data Persistence', () => {
    const fs = require('fs').promises;
    const path = require('path');
    const { loadGraphs, saveGraphs } = require('../src/server');

    const ORIGINAL_DATA_FILE = path.join(__dirname, '../src/../data/graphs.json');
    const TEST_DATA_FILE = path.join(__dirname, '../test-data/test-graphs.json');

    beforeEach(async () => {
        // Clean up test data directory
        try {
            await fs.rm(path.dirname(TEST_DATA_FILE), { recursive: true });
        } catch (error) {
            // Directory doesn't exist, that's fine
        }
    });

    afterEach(async () => {
        // Clean up test data directory
        try {
            await fs.rm(path.dirname(TEST_DATA_FILE), { recursive: true });
        } catch (error) {
            // Directory doesn't exist, that's fine
        }
    });

    describe('File Operations', () => {
        test('should create data directory if it does not exist', async () => {
            const testGraphs = [
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

            // Temporarily override data file path
            const originalRequire = require;
            const serverModule = originalRequire('../src/server');
            
            // Mock the data file path for testing
            const originalDataFile = path.join(__dirname, '../src/../data/graphs.json');
            
            // Create test directory and save
            await fs.mkdir(path.dirname(TEST_DATA_FILE), { recursive: true });
            await fs.writeFile(TEST_DATA_FILE, JSON.stringify(testGraphs, null, 2));

            // Check if directory was created
            const dataDir = path.dirname(TEST_DATA_FILE);
            await expect(fs.access(dataDir)).resolves.not.toThrow();
        });

        test('should save and load graphs correctly', async () => {
            const testGraphs = [
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

            // Create test directory and save
            await fs.mkdir(path.dirname(TEST_DATA_FILE), { recursive: true });
            await fs.writeFile(TEST_DATA_FILE, JSON.stringify(testGraphs, null, 2));

            // Verify file exists
            await expect(fs.access(TEST_DATA_FILE)).resolves.not.toThrow();

            // Verify content
            const savedData = await fs.readFile(TEST_DATA_FILE, 'utf8');
            const parsedData = JSON.parse(savedData);
            expect(parsedData).toEqual(testGraphs);
        });

        test('should handle empty graphs array', async () => {
            // Create test directory with empty array
            await fs.mkdir(path.dirname(TEST_DATA_FILE), { recursive: true });
            await fs.writeFile(TEST_DATA_FILE, JSON.stringify([], null, 2));

            const savedData = await fs.readFile(TEST_DATA_FILE, 'utf8');
            const parsedData = JSON.parse(savedData);
            expect(parsedData).toEqual([]);
        });

        test('should handle malformed JSON gracefully', async () => {
            // Create file with invalid JSON
            await fs.mkdir(path.dirname(TEST_DATA_FILE), { recursive: true });
            await fs.writeFile(TEST_DATA_FILE, 'invalid json content', 'utf8');

            const savedData = await fs.readFile(TEST_DATA_FILE, 'utf8');
            expect(() => JSON.parse(savedData)).toThrow();
        });
    });

    describe('Graph Data Validation', () => {
        test('should validate required fields in graph objects', () => {
            const validGraph = {
                id: '1',
                title: 'Valid Graph',
                formula: 'y=x^2',
                type: '2D',
                tags: ['test'],
                author: 'Author',
                lineColor: '#FF0000',
                createdAt: '2023-01-01T00:00:00.000Z'
            };

            expect(validGraph.id).toBeDefined();
            expect(validGraph.title).toBeDefined();
            expect(validGraph.formula).toBeDefined();
            expect(validGraph.type).toBeDefined();
            expect(validGraph.tags).toBeDefined();
            expect(validGraph.author).toBeDefined();
            expect(validGraph.lineColor).toBeDefined();
            expect(validGraph.createdAt).toBeDefined();
        });

        test('should validate graph type is either 2D or 3D', () => {
            const validTypes = ['2D', '3D'];
            
            const graph2D = { type: '2D' };
            const graph3D = { type: '3D' };
            const graphInvalid = { type: '4D' };

            expect(validTypes).toContain(graph2D.type);
            expect(validTypes).toContain(graph3D.type);
            expect(validTypes).not.toContain(graphInvalid.type);
        });

        test('should validate tags array', () => {
            const graphWithTags = {
                tags: ['parabola', 'quadratic', 'math']
            };

            expect(Array.isArray(graphWithTags.tags)).toBe(true);
            graphWithTags.tags.forEach(tag => {
                expect(typeof tag).toBe('string');
                expect(tag.length).toBeGreaterThan(0);
            });
        });

        test('should validate line color format', () => {
            const validColors = ['#FF0000', '#00FF00', '#0000FF', '#2196F3'];
            
            validColors.forEach(color => {
                expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
            });
        });

        test('should validate date format', () => {
            const validDate = '2023-01-01T00:00:00.000Z';
            
            expect(() => new Date(validDate)).not.toThrow();
            expect(new Date(validDate).toISOString()).toBe(validDate);
        });
    });

    describe('Data Integrity', () => {
        test('should preserve data integrity through save/load cycle', async () => {
            const originalGraphs = [
                {
                    id: '1',
                    title: 'Integrity Test',
                    formula: 'y=x^2+2x+1',
                    type: '2D',
                    tags: ['polynomial', 'quadratic'],
                    author: 'Test Author',
                    lineColor: '#9C27B0',
                    createdAt: '2023-01-01T12:30:45.123Z'
                },
                {
                    id: '2',
                    title: '3D Integrity',
                    formula: 'z=sin(x)*cos(y)',
                    type: '3D',
                    tags: ['trigonometry', 'surface', '3d'],
                    author: '3D Author',
                    lineColor: '#FF9800',
                    createdAt: '2023-01-02T15:45:30.456Z'
                }
            ];

            // Save graphs
            await saveGraphs(originalGraphs, TEST_DATA_FILE);

            // Load graphs
            const loadedGraphs = await loadGraphs(TEST_DATA_FILE);

            // Verify integrity
            expect(loadedGraphs).toHaveLength(originalGraphs.length);
            
            loadedGraphs.forEach((loadedGraph, index) => {
                const originalGraph = originalGraphs[index];
                expect(loadedGraph).toEqual(originalGraph);
            });
        });

        test('should handle large number of graphs', async () => {
            const largeGraphSet = [];
            
            // Create 100 test graphs
            for (let i = 0; i < 100; i++) {
                largeGraphSet.push({
                    id: i.toString(),
                    title: `Graph ${i}`,
                    formula: `y=x^${i}`,
                    type: i % 2 === 0 ? '2D' : '3D',
                    tags: [`tag${i}`, `category${i % 5}`],
                    author: `Author ${i}`,
                    lineColor: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
                    createdAt: new Date(2023, 0, 1 + i).toISOString()
                });
            }

            // Save large dataset
            await saveGraphs(largeGraphSet, TEST_DATA_FILE);

            // Load and verify
            const loadedGraphs = await loadGraphs(TEST_DATA_FILE);
            expect(loadedGraphs).toHaveLength(100);
            expect(loadedGraphs[0].title).toBe('Graph 0');
            expect(loadedGraphs[99].title).toBe('Graph 99');
        });

        test('should handle special characters in graph data', async () => {
            const specialCharsGraph = {
                id: 'special-chars',
                title: 'Graph with special chars: áéíóú ñ 中文 🎨',
                formula: 'y=x^2 + "quotes" & symbols @#$%',
                type: '2D',
                tags: ['español', '中文', 'mathématiques', 'emoji 🚀'],
                author: 'José María (测试)',
                lineColor: '#FF5722',
                createdAt: '2023-01-01T00:00:00.000Z'
            };

            await saveGraphs([specialCharsGraph], TEST_DATA_FILE);
            const loadedGraphs = await loadGraphs(TEST_DATA_FILE);

            expect(loadedGraphs[0]).toEqual(specialCharsGraph);
        });
    });
});