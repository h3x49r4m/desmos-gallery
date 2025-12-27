const request = require('supertest');
const { app } = require('../src/server');

describe('API Endpoints', () => {
    test('GET /api/graphs should return empty array initially', async () => {
        const response = await request(app)
            .get('/api/graphs')
            .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/graphs should create new graph', async () => {
        const newGraph = {
            title: 'Test Graph',
            formula: 'y=x^2',
            type: '2D',
            tags: ['test'],
            author: 'Test Author',
            lineColor: '#FF0000'
        };

        const response = await request(app)
            .post('/api/graphs')
            .send(newGraph)
            .expect(201);

        expect(response.body.title).toBe(newGraph.title);
        expect(response.body.formula).toBe(newGraph.formula);
        expect(response.body.id).toBeDefined();
        expect(response.body.createdAt).toBeDefined();
    });

    test('GET /api/graphs/:id should return specific graph', async () => {
        // First create a graph
        const newGraph = {
            title: 'Test Graph 2',
            formula: 'y=x^3',
            type: '2D',
            tags: ['test', 'cubic'],
            author: 'Test Author',
            lineColor: '#00FF00'
        };

        const createResponse = await request(app)
            .post('/api/graphs')
            .send(newGraph)
            .expect(201);

        const graphId = createResponse.body.id;

        // Then retrieve it
        const getResponse = await request(app)
            .get(`/api/graphs/${graphId}`)
            .expect(200);

        expect(getResponse.body.title).toBe(newGraph.title);
        expect(getResponse.body.id).toBe(graphId);
    });

    test('GET /api/graphs/:id should return 404 for non-existent graph', async () => {
        await request(app)
            .get('/api/graphs/non-existent-id')
            .expect(404);
    });

    test('GET /api/tags should return unique tags', async () => {
        // Create some graphs with tags
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
                formula: 'y=x^3',
                type: '2D',
                tags: ['cubic', 'polynomial'],
                author: 'Author 2',
                lineColor: '#00FF00'
            },
            {
                title: 'Graph 3',
                formula: 'y=x^2+1',
                type: '2D',
                tags: ['parabola', 'shifted'],
                author: 'Author 3',
                lineColor: '#0000FF'
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
});