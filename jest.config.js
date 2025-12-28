module.exports = {
    testEnvironment: 'node',
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    collectCoverageFrom: [
        'src/**/*.js',
        'static/js/**/*.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    verbose: true,
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    projects: [
        {
            displayName: 'Server Tests',
            testMatch: [
                '<rootDir>/tests/server.test.js', 
                '<rootDir>/tests/data-manager.test.js', 
                '<rootDir>/tests/simple.test.js',
                '<rootDir>/tests/batch-delete.test.js',
                '<rootDir>/tests/form-layout.test.js',
                '<rootDir>/tests/modal-tag-bug.test.js'
            ],
            testEnvironment: 'node'
        },
        {
            displayName: 'UI Tests',
            testMatch: [
                '<rootDir>/tests/ui-components.test.js',
                '<rootDir>/tests/batch-selection-ui.test.js',
                '<rootDir>/tests/modal-edit.test.js',
                '<rootDir>/tests/type-filter.test.js',
                '<rootDir>/tests/download-feature.test.js',
                '<rootDir>/tests/formula-rendering.test.js'
            ],
            testEnvironment: 'jsdom',
            setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
        }
    ]
};