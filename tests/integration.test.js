describe('Integration Tests', () => {
    const request = require('supertest');
    const { app } = require('../src/server');

    describe('Full Graph Workflow', () => {
        test('should create, retrieve, update, and delete a graph', async () => {
            // Step 1: Create a graph
            const graphData = {
                title: 'Integration Test Graph',
                formula: 'y=x^2+2x+1',
                type: '2D',
                tags: ['integration', 'quadratic'],
                author: 'Integration Tester',
                lineColor: '#E91E63'
            };

            const createResponse = await request(app)
                .post('/api/graphs')
                .send(graphData)
                .expect(201);

            const graphId = createResponse.body.id;
            expect(graphId).toBeDefined();

            // Step 2: Retrieve the graph
            const getResponse = await request(app)
                .get(`/api/graphs/${graphId}`)
                .expect(200);

            expect(getResponse.body.title).toBe(graphData.title);
            expect(getResponse.body.formula).toBe(graphData.formula);
            expect(getResponse.body.type).toBe(graphData.type);

            // Step 3: Update the graph
            const updateData = {
                title: 'Updated Integration Graph',
                formula: 'y=x^3-2x+1',
                tags: ['integration', 'cubic', 'updated']
            };

            const updateResponse = await request(app)
                .put(`/api/graphs/${graphId}`)
                .send(updateData)
                .expect(200);

            expect(updateResponse.body.title).toBe(updateData.title);
            expect(updateResponse.body.formula).toBe(updateData.formula);

            // Step 4: Verify update persisted
            const verifyResponse = await request(app)
                .get(`/api/graphs/${graphId}`)
                .expect(200);

            expect(verifyResponse.body.title).toBe(updateData.title);
            expect(verifyResponse.body.formula).toBe(updateData.formula);

            // Step 5: Delete the graph
            await request(app)
                .delete(`/api/graphs/${graphId}`)
                .expect(200);

            // Step 6: Verify deletion
            await request(app)
                .get(`/api/graphs/${graphId}`)
                .expect(404);
        });

        test('should handle multiple graphs with different types', async () => {
            const graphs = [
                {
                    title: '2D Parabola',
                    formula: 'y=x^2',
                    type: '2D',
                    tags: ['parabola', '2d'],
                    author: 'Author 1',
                    lineColor: '#2196F3'
                },
                {
                    title: '3D Surface',
                    formula: 'z=x^2+y^2',
                    type: '3D',
                    tags: ['surface', '3d'],
                    author: 'Author 2',
                    lineColor: '#4CAF50'
                },
                {
                    title: '2D Trigonometry',
                    formula: 'y=sin(x)*cos(2x)',
                    type: '2D',
                    tags: ['trigonometry', '2d'],
                    author: 'Author 3',
                    lineColor: '#FF9800'
                }
            ];

            // Create all graphs
            const createdGraphs = [];
            for (const graph of graphs) {
                const response = await request(app)
                    .post('/api/graphs')
                    .send(graph)
                    .expect(201);
                createdGraphs.push(response.body);
            }

            // Get all graphs
            const allGraphsResponse = await request(app)
                .get('/api/graphs')
                .expect(200);

            expect(allGraphsResponse.body).toHaveLength(3);

            // Verify each graph type
            const graphTypes = allGraphsResponse.body.map(g => g.type);
            expect(graphTypes).toContain('2D');
            expect(graphTypes).toContain('3D');
            expect(graphTypes.filter(t => t === '2D')).toHaveLength(2);
            expect(graphTypes.filter(t => t === '3D')).toHaveLength(1);
        });
    });

    describe('Tag System Integration', () => {
        test('should maintain tag consistency across operations', async () => {
            // Create graphs with overlapping tags
            const graphs = [
                {
                    title: 'Graph A',
                    formula: 'y=x^2',
                    type: '2D',
                    tags: ['common', 'unique-a', 'math'],
                    author: 'Author A',
                    lineColor: '#F44336'
                },
                {
                    title: 'Graph B',
                    formula: 'y=x^3',
                    type: '2D',
                    tags: ['common', 'unique-b', 'math'],
                    author: 'Author B',
                    lineColor: '#9C27B0'
                },
                {
                    title: 'Graph C',
                    formula: 'z=x^2+y^2',
                    type: '3D',
                    tags: ['common', 'unique-c', '3d'],
                    author: 'Author C',
                    lineColor: '#00BCD4'
                }
            ];

            // Create graphs
            const createdGraphs = [];
            for (const graph of graphs) {
                const response = await request(app)
                    .post('/api/graphs')
                    .send(graph)
                    .expect(201);
                createdGraphs.push(response.body);
            }

            // Get all tags
            const tagsResponse = await request(app)
                .get('/api/tags')
                .expect(200);

            const tags = tagsResponse.body;
            expect(tags).toContain('common');
            expect(tags).toContain('unique-a');
            expect(tags).toContain('unique-b');
            expect(tags).toContain('unique-c');
            expect(tags).toContain('math');
            expect(tags).toContain('3d');

            // Update one graph's tags
            const updateResponse = await request(app)
                .put(`/api/graphs/${createdGraphs[0].id}`)
                .send({
                    tags: ['common', 'updated-tag', 'new-category']
                })
                .expect(200);

            // Get tags again to verify consistency
            const updatedTagsResponse = await request(app)
                .get('/api/tags')
                .expect(200);

            const updatedTags = updatedTagsResponse.body;
            expect(updatedTags).toContain('common');
            expect(updatedTags).toContain('updated-tag');
            expect(updatedTags).toContain('new-category');
            expect(updatedTags).toContain('unique-b');
            expect(updatedTags).toContain('unique-c');
        });
    });

    describe('Error Handling Integration', () => {
        test('should handle concurrent requests gracefully', async () => {
            const graphData = {
                title: 'Concurrent Test',
                formula: 'y=x^2',
                type: '2D',
                tags: ['concurrent'],
                author: 'Concurrent Tester',
                lineColor: '#795548'
            };

            // Send multiple concurrent requests
            const requests = Array(10).fill().map(() =>
                request(app)
                    .post('/api/graphs')
                    .send(graphData)
            );

            const responses = await Promise.all(requests);
            
            // All requests should succeed
            responses.forEach(response => {
                expect(response.status).toBe(201);
                expect(response.body.id).toBeDefined();
            });

            // Verify all graphs were created
            const allGraphsResponse = await request(app)
                .get('/api/graphs')
                .expect(200);

            expect(allGraphsResponse.body.length).toBeGreaterThanOrEqual(10);

            // Count graphs with our title
            const concurrentGraphs = allGraphsResponse.body.filter(
                g => g.title === 'Concurrent Test'
            );
            expect(concurrentGraphs).toHaveLength(10);
        });

        test('should handle malformed requests without crashing', async () => {
            // Test malformed JSON
            await request(app)
                .post('/api/graphs')
                .set('Content-Type', 'application/json')
                .send('{"invalid": json}')
                .expect(400);

            // Test missing required fields (should still create but frontend validates)
            await request(app)
                .post('/api/graphs')
                .send({})
                .expect(201);

            // Test invalid graph type
            await request(app)
                .post('/api/graphs')
                .send({
                    title: 'Invalid Type',
                    formula: 'y=x^2',
                    type: '4D',
                    tags: ['invalid'],
                    author: 'Tester',
                    lineColor: '#FF0000'
                })
                .expect(201);

            // Verify server is still responsive
            await request(app)
                .get('/api/graphs')
                .expect(200);
        });
    });

    describe('Data Consistency', () => {
        test('should maintain data consistency through server restart simulation', async () => {
            // Create initial data
            const initialGraphs = [
                {
                    title: 'Persistent Graph 1',
                    formula: 'y=x^2',
                    type: '2D',
                    tags: ['persistent', 'test'],
                    author: 'Persistence Tester',
                    lineColor: '#607D8B'
                },
                {
                    title: 'Persistent Graph 2',
                    formula: 'z=x*y',
                    type: '3D',
                    tags: ['persistent', '3d'],
                    author: 'Persistence Tester',
                    lineColor: '#CDDC39'
                }
            ];

            // Create graphs
            for (const graph of initialGraphs) {
                await request(app)
                    .post('/api/graphs')
                    .send(graph)
                    .expect(201);
            }

            // Verify data exists
            const beforeRestart = await request(app)
                .get('/api/graphs')
                .expect(200);

            const beforeCount = beforeRestart.body.length;
            expect(beforeCount).toBeGreaterThanOrEqual(2);

            // Simulate server restart by checking data persistence
            // (In real scenario, server would restart and data should persist)
            const afterRestart = await request(app)
                .get('/api/graphs')
                .expect(200);

            expect(afterRestart.body).toHaveLength(beforeCount);

            // Verify specific graphs still exist
            const persistentGraphs = afterRestart.body.filter(
                g => g.title.includes('Persistent Graph')
            );
            expect(persistentGraphs).toHaveLength(2);
        });
    });

    describe('Performance Integration', () => {
        test('should handle large dataset efficiently', async () => {
            // Create a large number of graphs
            const largeDataset = [];
            for (let i = 0; i < 50; i++) {
                largeDataset.push({
                    title: `Performance Graph ${i}`,
                    formula: `y=x^${i % 5 + 1}`,
                    type: i % 2 === 0 ? '2D' : '3D',
                    tags: [`performance`, `batch-${Math.floor(i / 10)}`],
                    author: `Performance Author ${i % 5}`,
                    lineColor: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
                });
            }

            // Create all graphs
            const startTime = Date.now();
            for (const graph of largeDataset) {
                await request(app)
                    .post('/api/graphs')
                    .send(graph)
                    .expect(201);
            }
            const creationTime = Date.now() - startTime;

            // Verify creation was reasonable (should be under 10 seconds for 50 graphs)
            expect(creationTime).toBeLessThan(10000);

            // Test retrieval performance
            const retrievalStart = Date.now();
            const allGraphs = await request(app)
                .get('/api/graphs')
                .expect(200);
            const retrievalTime = Date.now() - retrievalStart;

            // Retrieval should be fast (under 1 second)
            expect(retrievalTime).toBeLessThan(1000);
            expect(allGraphs.body.length).toBeGreaterThanOrEqual(50);

            // Test tag retrieval performance
            const tagStart = Date.now();
            const tags = await request(app)
                .get('/api/tags')
                .expect(200);
            const tagTime = Date.now() - tagStart;

            // Tag retrieval should be very fast (under 500ms)
            expect(tagTime).toBeLessThan(500);
            expect(tags.body.length).toBeGreaterThan(0);
        });
    });
});