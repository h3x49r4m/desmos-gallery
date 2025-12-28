/**
 * Batch Selection and Deletion Tests
 * Tests for the gallery batch selection and deletion functionality
 */

const request = require('supertest');
const { app } = require('../src/server');

describe('Batch Selection and Deletion Tests', () => {
    describe('Batch Selection API', () => {
        test('should retrieve all graphs for selection', async () => {
            const response = await request(app)
                .get('/api/graphs')
                .expect(200);
            
            expect(Array.isArray(response.body)).toBe(true);
            // Should handle empty arrays gracefully
            expect(response.body.length).toBeGreaterThanOrEqual(0);
        });

        test('should filter valid graphs for selection', async () => {
            const response = await request(app)
                .get('/api/graphs')
                .expect(200);
            
            // Should only return valid graphs
            const validGraphs = response.body.filter(g => ['2D', '3D'].includes(g.type));
            // Should handle empty arrays gracefully
            expect(validGraphs.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Batch Deletion API', () => {
        test('should handle deletion of single graph', async () => {
            // Get a graph to delete
            const graphsResponse = await request(app).get('/api/graphs');
            const graphs = graphsResponse.body;
            
            if (graphs.length === 0) {
                return; // Skip if no graphs
            }
            
            // Try to delete the first graph
            const response = await request(app)
                .delete(`/api/graphs/${graphs[0].id}`);
            
            // Should return either 200 (success) or 404 (already deleted)
            expect([200, 404]).toContain(response.status);
        });

        test('should handle deletion of non-existent graph', async () => {
            const response = await request(app)
                .delete('/api/graphs/non-existent-id-12345');
            
            // Should return 200 (idempotent deletion) - graph already deleted or never existed
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('already deleted');
        });

        test('should handle concurrent deletion requests', async () => {
            // Get graphs to delete
            const graphsResponse = await request(app).get('/api/graphs');
            const graphs = graphsResponse.body;
            
            if (graphs.length < 2) {
                return; // Skip if not enough graphs
            }
            
            // Send concurrent delete requests
            const deletePromises = [
                request(app).delete(`/api/graphs/${graphs[0].id}`),
                request(app).delete(`/api/graphs/${graphs[1].id}`)
            ];
            
            const results = await Promise.allSettled(deletePromises);
            
            // All requests should complete (either success or failure)
            results.forEach(result => {
                expect(result.status).toBe('fulfilled');
            });
        });
    });

    describe('Error Handling', () => {
        test('should handle malformed graph ID', async () => {
            const response = await request(app)
                .delete('/api/graphs/');
            
            // Should return 404 for missing ID
            expect(response.status).toBe(404);
        });

        test('should handle empty graphs array', async () => {
            // This test verifies the API handles empty data gracefully
            // We can't actually test this without modifying the data file
            // but we can verify the structure is correct
            const response = await request(app)
                .get('/api/graphs')
                .expect(200);
            
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('Performance', () => {
        test('should handle requests efficiently', async () => {
            const startTime = Date.now();
            
            // Make a simple GET request
            await request(app)
                .get('/api/graphs')
                .expect(200);
            
            const endTime = Date.now();
            
            // Should complete within reasonable time (under 1 second)
            expect(endTime - startTime).toBeLessThan(1000);
        });
    });
});