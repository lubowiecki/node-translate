module.exports = {
  forceExit: true,
  verbose: true,
  collectCoverage: false,
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['./**/*.spec.(ts|js)'],
  testEnvironment: 'node',
};
