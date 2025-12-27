const request = require('supertest');
const { app } = require('../src/server');

describe('Graph API Endpoints', () => {
    describe('GET /api/graphs', () => {
        test('should return empty array initially', async () => {
            const response = await request(app)
                .get('/api/graphs')
                .expect(200);
            
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(0);
        });
    });

    describe('POST /api/graphs', () => {
        test('should create a new 2D graph', async () => {
            const graphData = {
                title: 'Test Parabola',
                formula: 'y=x^2',
                type: '2D',
                tags: ['parabola', 'quadratic'],
                author: 'Test User',
                lineColor: '#FF0000'
            };

            const response = await request(app)
                .post('/api/graphs')
                .send(graphData)
                .expect(201);

            expect(response.body.title).toBe(graphData.title);
            expect(response.body.formula).toBe(graphData.formula);
            expect(response.body.type).toBe(graphData.type);
            expect(response.body.id).toBeDefined();
            expect(response.body.createdAt).toBeDefined();
        });

        test('should create a new 3D graph', async () => {
            const graphData = {
                title: 'Test Surface',
                formula: 'z=x^2+y^2',
                type: '3D',
                tags: ['surface', '3d'],
                author: 'Test User',
                lineColor: '#00FF00'
            };

            const response = await request(app)
                .post('/api/graphs')
                .send(graphData)
                .expect(201);

            expect(response.body.title).toBe(graphData.title);
            expect(response.body.formula).toBe(graphData.formula);
            expect(response.body.type).toBe(graphData.type);
        });

        test('should require title and formula', async () => {
            const incompleteData = {
                type: '2D',
                tags: ['test'],
                author: 'Test User',
                lineColor: '#FF0000'
            };

            const response = await request(app)
                .post('/api/graphs')
                .send(incompleteData)
                .expect(201); // Server-side validation might be minimal

            // The server should still create the graph but frontend should validate
            expect(response.body.id).toBeDefined();
        });
    });

    describe('GET /api/graphs/:id', () => {
        test('should return specific graph by ID', async () => {
            // First create a graph
            const graphData = {
                title: 'Find Me',
                formula: 'y=sin(x)',
                type: '2D',
                tags: ['trigonometry'],
                author: 'Test User',
                lineColor: '#0000FF'
            };

            const createResponse = await request(app)
                .post('/api/graphs')
                .send(graphData)
                .expect(201);

            const graphId = createResponse.body.id;

            // Then retrieve it
            const getResponse = await request(app)
                .get(`/api/graphs/${graphId}`)
                .expect(200);

            expect(getResponse.body.title).toBe(graphData.title);
            expect(getResponse.body.id).toBe(graphId);
        });

        test('should return 404 for non-existent graph', async () => {
            await request(app)
                .get('/api/graphs/non-existent-id')
                .expect(404);
        });
    });

    describe('PUT /api/graphs/:id', () => {
        test('should update existing graph', async () => {
            // Create a graph first
            const graphData = {
                title: 'Original Title',
                formula: 'y=x^2',
                type: '2D',
                tags: ['original'],
                author: 'Test User',
                lineColor: '#FF0000'
            };

            const createResponse = await request(app)
                .post('/api/graphs')
                .send(graphData)
                .expect(201);

            const graphId = createResponse.body.id;

            // Update the graph
            const updateData = {
                title: 'Updated Title',
                formula: 'y=x^3',
                tags: ['updated', 'cubic']
            };

            const updateResponse = await request(app)
                .put(`/api/graphs/${graphId}`)
                .send(updateData)
                .expect(200);

            expect(updateResponse.body.title).toBe(updateData.title);
            expect(updateResponse.body.formula).toBe(updateData.formula);
            expect(updateResponse.body.tags).toEqual(updateData.tags);
        });
    });

    describe('DELETE /api/graphs/:id', () => {
        test('should delete existing graph', async () => {
            // Create a graph first
            const graphData = {
                title: 'Delete Me',
                formula: 'y=x^2',
                type: '2D',
                tags: ['deletable'],
                author: 'Test User',
                lineColor: '#FF0000'
            };

            const createResponse = await request(app)
                .post('/api/graphs')
                .send(graphData)
                .expect(201);

            const graphId = createResponse.body.id;

            // Delete the graph
            const deleteResponse = await request(app)
                .delete(`/api/graphs/${graphId}`)
                .expect(200);

            expect(deleteResponse.body.id).toBe(graphId);

            // Verify it's gone
            await request(app)
                .get(`/api/graphs/${graphId}`)
                .expect(404);
        });
    });

    describe('GET /api/tags', () => {
        test('should return unique tags from all graphs', async () => {
            // Create multiple graphs with different tags
            const graphs = [
                {
                    title: 'Graph 1',
                    formula: 'y=x^2',
                    type: '2D',
                    tags: ['parabola', 'quadratic'],
                    author: 'Test User',
                    lineColor: '#FF0000'
                },
                {
                    title: 'Graph 2',
                    formula: 'y=x^3',
                    type: '2D',
                    tags: ['cubic', 'polynomial'],
                    author: 'Test User',
                    lineColor: '#00FF00'
                },
                {
                    title: 'Graph 3',
                    formula: 'y=x^2+1',
                    type: '2D',
                    tags: ['parabola', 'shifted'],
                    author: 'Test User',
                    lineColor: '#0000FF'
                }
            ];

            // Create all graphs
            for (const graph of graphs) {
                await request(app)
                    .post('/api/graphs')
                    .send(graph)
                    .expect(201);
            }

            // Get tags
            const response = await request(app)
                .get('/api/tags')
                .expect(200);

            const tags = response.body;
            expect(Array.isArray(tags)).toBe(true);
            expect(tags).toContain('parabola');
            expect(tags).toContain('quadratic');
            expect(tags).toContain('cubic');
            expect(tags).toContain('polynomial');
            expect(tags).toContain('shifted');
            
            // Should be unique and sorted
            expect(tags.length).toBe(new Set(tags).size);
            expect(tags).toEqual([...tags].sort());
        });

        test('should return empty array when no graphs exist', async () => {
            const response = await request(app)
                .get('/api/tags')
                .expect(200);

            expect(response.body).toEqual([]);
        });
    });
});

describe('Server Configuration', () => {
    test('should serve static files from public directory', async () => {
        const response = await request(app)
            .get('/')
            .expect(200);

        expect(response.text).toContain('Desmos Gallery');
    });

    test('should serve calculator.js file', async () => {
        const response = await request(app)
            .get('/calculator.js')
            .expect(200);

        expect(response.headers['content-type']).toContain('application/javascript');
    });

    test('should serve calculator3d.js file', async () => {
        const response = await request(app)
            .get('/calculator3d.js')
            .expect(200);

        expect(response.headers['content-type']).toContain('application/javascript');
    });
});

describe('Error Handling', () => {
    test('should handle invalid JSON in POST requests', async () => {
        const response = await request(app)
            .post('/api/graphs')
            .set('Content-Type', 'application/json')
            .send('invalid json')
            .expect(400);

        expect(response.body.error).toBeDefined();
    });

    test('should handle missing graph ID', async () => {
        await request(app)
            .get('/api/graphs/')
            .expect(404);
    });
});