module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testPathIgnorePatterns: ['<rootDir>/_bak/', '<rootDir>/tests/graphManager.test.js', '<rootDir>/tests/galleryManager.test.js'],
    projects: [
        {
            displayName: 'node',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/tests/api.test.js', '<rootDir>/tests/data-persistence.test.js', '<rootDir>/tests/integration.test.js'],
            setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
        }
    ]
};