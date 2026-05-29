module.exports = {
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
    rootDir: 'app',
    testRegex: '.*\\.spec\\.tsx?$',
    transform: {
        '^.+\\.(t|j)sx?$': 'ts-jest',
    },
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/../jest.setup.ts'],
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json',
        },
    },
    moduleNameMapper: {
        '\\.(css|scss)$': '<rootDir>/../__mocks__/styleMock.js',
        '\\.(svg|png|jpg)$': '<rootDir>/../__mocks__/fileMock.js',
    },
};