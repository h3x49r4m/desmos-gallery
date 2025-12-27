module.exports = {
    testEnvironment: 'node',
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    collectCoverageFrom: [
        'src/**/*.js',
        'public/src/**/*.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    verbose: true,
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    projects: [
        {
            displayName: 'Server Tests',
            testMatch: ['<rootDir>/tests/server.test.js', '<rootDir>/tests/data-manager.test.js', '<rootDir>/tests/simple.test.js'],
            testEnvironment: 'node'
        },
        {
            displayName: 'UI Tests',
            testMatch: ['<rootDir>/tests/ui-components.test.js'],
            testEnvironment: 'jsdom',
            setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
        }
    ]
};