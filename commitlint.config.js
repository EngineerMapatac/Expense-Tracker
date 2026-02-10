module.exports = {
  extends: ['@commitlint/config-conventional'],
  
  rules: {
    // Custom rules for this project
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting, missing semicolons, etc
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding tests
        'chore',    // Maintenance tasks
        'revert',   // Reverting changes
        'build',    // Build system changes
        'ci'        // CI configuration changes
      ]
    ],
    
    // Subject must not be empty
    'subject-empty': [2, 'never'],
    
    // Subject must be lowercase
    'subject-case': [2, 'always', 'lower-case'],
    
    // Max length for header
    'header-max-length': [2, 'always', 100],
    
    // Type must be lowercase
    'type-case': [2, 'always', 'lower-case'],
    
    // Scope is optional but if present should be lowercase
    'scope-case': [2, 'always', 'lower-case']
  }
};
