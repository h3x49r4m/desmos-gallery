// Test setup file
const fs = require('fs').promises;
const path = require('path');

// Clean up test data before and after tests
const TEST_DATA_DIR = path.join(__dirname, '../test-data');

beforeAll(async () => {
    try {
        await fs.rm(TEST_DATA_DIR, { recursive: true });
    } catch (error) {
        // Directory doesn't exist, that's fine
    }
});

afterAll(async () => {
    try {
        await fs.rm(TEST_DATA_DIR, { recursive: true });
    } catch (error) {
        // Directory doesn't exist, that's fine
    }
});

// Add a simple test to avoid "empty test suite" error
describe('Test Setup', () => {
    test('setup is working', () => {
        expect(true).toBe(true);
    });
});