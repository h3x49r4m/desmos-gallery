/**
 * Server Tests
 * Tests for the Express server functionality
 */

const fs = require('fs').promises;
const path = require('path');

// Set environment variable before importing server
const TEST_DATA_FILE = path.join(__dirname, '../test-data/graphs-test.json');
process.env.DATA_FILE = TEST_DATA_FILE;

const request = require('supertest');
const { app } = require('../src/server');

describe('Server Tests', () => {
    beforeAll(async () => {
        // Ensure test data directory exists
        const testDir = path.dirname(TEST_DATA_FILE);
        try {
            await fs.access(testDir);
        } catch {
            await fs.mkdir(testDir, { recursive: true });
        }
        
        // Clean up any existing test data
        try {
            await fs.unlink(TEST_DATA_FILE);
        } catch (error) {
            // File doesn't exist, that's fine
        }
    });
    
    beforeEach(async () => {
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

    afterAll(async () => {
        // Clean up test data file
        try {
            await fs.unlink(TEST_DATA_FILE);
        } catch (error) {
            // File doesn't exist, that's fine
        }
    });

    describe('Static File Serving', () => {
        test('should serve index.html', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);
            
            expect(response.headers['content-type']).toMatch(/text\/html/);
        });

        test('should serve gallery.html', async () => {
            const response = await request(app)
                .get('/gallery.html')
                .expect(200);
            
            expect(response.headers['content-type']).toMatch(/text\/html/);
        });

        test('should serve CSS files', async () => {
            const response = await request(app)
                .get('/css/styles.css')
                .expect(200);
            
            expect(response.headers['content-type']).toMatch(/text\/css/);
        });

        test('should serve JavaScript files', async () => {
            const response = await request(app)
                .get('/js/graphManager.js')
                .expect(200);
            
            expect(response.headers['content-type']).toMatch(/application\/javascript/);
        });

        test('should serve calculator.js', async () => {
            const response = await request(app)
                .get('/calculator.js')
                .expect(200);
            
            expect(response.headers['content-type']).toMatch(/application\/javascript/);
        });

        test('should return 404 for non-existent files', async () => {
            await request(app)
                .get('/non-existent-file.html')
                .expect(404);
        });
    });

    describe('API Endpoints', () => {
        describe('GET /api/graphs', () => {
            test('should return empty array when no graphs exist', async () => {
                const response = await request(app)
                    .get('/api/graphs')
                    .expect(200);
                
                expect(Array.isArray(response.body)).toBe(true);
                expect(response.body).toHaveLength(0);
            });

            test('should return graphs when they exist', async () => {
                // Create a test graph first
                const graphData = {
                    id: 'test-1',
                    title: 'Test Graph',
                    formula: 'y=x^2',
                    type: '2D',
                    tags: ['test'],
                    author: 'Test Author',
                    lineColor: '#FF0000',
                    createdAt: new Date().toISOString()
                };

                await request(app)
                    .post('/api/graphs')
                    .send(graphData)
                    .expect(201);

                const response = await request(app)
                    .get('/api/graphs')
                    .expect(200);

                expect(Array.isArray(response.body)).toBe(true);
                expect(response.body).toHaveLength(1);
                expect(response.body[0].title).toBe('Test Graph');
            });
        });

        describe('POST /api/graphs', () => {
            test('should create a new graph', async () => {
                const graphData = {
                    title: 'New Graph',
                    formula: 'y=sin(x)',
                    type: '2D',
                    tags: ['trigonometry'],
                    author: 'Test Author',
                    lineColor: '#2196F3'
                };

                const response = await request(app)
                    .post('/api/graphs')
                    .send(graphData)
                    .expect(201);

                expect(response.body.id).toBeDefined();
                expect(response.body.title).toBe('New Graph');
                expect(response.body.createdAt).toBeDefined();
            });

            test('should require title field', async () => {
                const graphData = {
                    formula: 'y=x^2',
                    type: '2D',
                    tags: ['test'],
                    author: 'Test Author',
                    lineColor: '#FF0000'
                };

                await request(app)
                    .post('/api/graphs')
                    .send(graphData)
                    .expect(400);
            });

            test('should require formula field', async () => {
                const graphData = {
                    title: 'Test Graph',
                    type: '2D',
                    tags: ['test'],
                    author: 'Test Author',
                    lineColor: '#FF0000'
                };

                await request(app)
                    .post('/api/graphs')
                    .send(graphData)
                    .expect(400);
            });

            test('should validate graph type', async () => {
                const graphData = {
                    title: 'Test Graph',
                    formula: 'y=x^2',
                    type: 'INVALID',
                    tags: ['test'],
                    author: 'Test Author',
                    lineColor: '#FF0000'
                };

                await request(app)
                    .post('/api/graphs')
                    .send(graphData)
                    .expect(400);
            });

            test('should handle malformed JSON', async () => {
                await request(app)
                    .post('/api/graphs')
                    .set('Content-Type', 'application/json')
                    .send('{"invalid": json}')
                    .expect(400);
            });
        });

        describe('GET /api/graphs/:id', () => {
            let graphId;

            beforeEach(async () => {
                const graphData = {
                    title: 'Test Graph',
                    formula: 'y=x^2',
                    type: '2D',
                    tags: ['test'],
                    author: 'Test Author',
                    lineColor: '#FF0000'
                };

                const response = await request(app)
                    .post('/api/graphs')
                    .send(graphData)
                    .expect(201);

                graphId = response.body.id;
            });

            test('should return specific graph by ID', async () => {
                const response = await request(app)
                    .get(`/api/graphs/${graphId}`)
                    .expect(200);

                expect(response.body.id).toBe(graphId);
                expect(response.body.title).toBe('Test Graph');
            });

            test('should return 404 for non-existent graph', async () => {
                await request(app)
                    .get('/api/graphs/non-existent-id')
                    .expect(404);
            });
        });

        describe('PUT /api/graphs/:id', () => {
            let graphId;

            beforeEach(async () => {
                const graphData = {
                    title: 'Original Graph',
                    formula: 'y=x^2',
                    type: '2D',
                    tags: ['original'],
                    author: 'Test Author',
                    lineColor: '#FF0000'
                };

                const response = await request(app)
                    .post('/api/graphs')
                    .send(graphData)
                    .expect(201);

                graphId = response.body.id;
            });

            test('should update existing graph', async () => {
                const updateData = {
                    title: 'Updated Graph',
                    formula: 'y=x^3'
                };

                const response = await request(app)
                    .put(`/api/graphs/${graphId}`)
                    .send(updateData)
                    .expect(200);

                expect(response.body.title).toBe('Updated Graph');
                expect(response.body.formula).toBe('y=x^3');
            });

            test('should return 404 when updating non-existent graph', async () => {
                await request(app)
                    .put('/api/graphs/non-existent-id')
                    .send({ title: 'Updated' })
                    .expect(404);
            });
        });

        describe('DELETE /api/graphs/:id', () => {
            let graphId;

            beforeEach(async () => {
                const graphData = {
                    title: 'Test Graph',
                    formula: 'y=x^2',
                    type: '2D',
                    tags: ['test'],
                    author: 'Test Author',
                    lineColor: '#FF0000'
                };

                const response = await request(app)
                    .post('/api/graphs')
                    .send(graphData)
                    .expect(201);

                graphId = response.body.id;
            });

            test('should delete existing graph', async () => {
                await request(app)
                    .delete(`/api/graphs/${graphId}`)
                    .expect(200);

                // Verify it's deleted
                await request(app)
                    .get(`/api/graphs/${graphId}`)
                    .expect(404);
            });

            test('should return 404 when deleting non-existent graph', async () => {
                await request(app)
                    .delete('/api/graphs/non-existent-id')
                    .expect(404);
            });
        });

        describe('GET /api/tags', () => {
            test('should return empty array when no graphs exist', async () => {
                const response = await request(app)
                    .get('/api/tags')
                    .expect(200);

                expect(Array.isArray(response.body)).toBe(true);
                expect(response.body).toHaveLength(0);
            });

            test('should return unique tags from graphs', async () => {
                // Create graphs with different tags
                const graphs = [
                    {
                        title: 'Graph 1',
                        formula: 'y=x^2',
                        type: '2D',
                        tags: ['parabola', 'quadratic'],
                        author: 'Author 1',
                        lineColor: '#FF0000'
                    },
                    {
                        title: 'Graph 2',
                        formula: 'y=sin(x)',
                        type: '2D',
                        tags: ['trigonometry', 'wave'],
                        author: 'Author 2',
                        lineColor: '#2196F3'
                    },
                    {
                        title: 'Graph 3',
                        formula: 'y=x^3',
                        type: '2D',
                        tags: ['parabola', 'cubic'],
                        author: 'Author 3',
                        lineColor: '#4CAF50'
                    }
                ];

                for (const graph of graphs) {
                    await request(app)
                        .post('/api/graphs')
                        .send(graph)
                        .expect(201);
                }

                const response = await request(app)
                    .get('/api/tags')
                    .expect(200);

                expect(Array.isArray(response.body)).toBe(true);
                expect(response.body).toContain('parabola');
                expect(response.body).toContain('quadratic');
                expect(response.body).toContain('trigonometry');
                expect(response.body).toContain('wave');
                expect(response.body).toContain('cubic');

                // Should not have duplicates
                const uniqueTags = [...new Set(response.body)];
                expect(response.body.length).toBe(uniqueTags.length);
            });
        });
    });

    describe('Error Handling', () => {
        test('should handle missing graph ID in GET request', async () => {
            await request(app)
                .get('/api/graphs/')
                .expect(200); // This is valid - returns all graphs
        });

        test('should handle missing graph ID in PUT request', async () => {
            await request(app)
                .put('/api/graphs/')
                .send({ title: 'Updated' })
                .expect(404);
        });

        test('should handle missing graph ID in DELETE request', async () => {
            await request(app)
                .delete('/api/graphs/')
                .expect(404);
        });

        test('should handle empty request body', async () => {
            await request(app)
                .post('/api/graphs')
                .send({})
                .expect(400);
        });

        test('should handle malformed request body', async () => {
            await request(app)
                .post('/api/graphs')
                .set('Content-Type', 'application/json')
                .send('{"incomplete": "json"')
                .expect(400);
        });
    });

    describe('Security Headers', () => {
        test('should set security headers', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);

            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['x-frame-options']).toBe('DENY');
            expect(response.headers['x-xss-protection']).toBe('1; mode=block');
            expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
        });
    });

    describe('CORS', () => {
        test('should handle CORS preflight requests', async () => {
            await request(app)
                .options('/api/graphs')
                .expect(204); // CORS preflight returns 204 No Content
        });

        test('should set CORS headers', async () => {
            const response = await request(app)
                .get('/api/graphs')
                .expect(200);

            expect(response.headers['access-control-allow-origin']).toBe('*');
        });
    });
});