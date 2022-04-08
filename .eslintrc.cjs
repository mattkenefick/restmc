module.exports = {
    env: {
        'browser': true,
        'es2021': true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    parserOptions: {
        'ecmaVersion': 12,
        'parser': '@typescript-eslint/parser',
        'sourceType': 'module',
    },
    plugins: ['@typescript-eslint'],
    rules: {
        '@typescript-eslint/no-inferrable-types': 0,
        'brace-style': ['error', 'stroustrup'],
        'comma-spacing': ['error', { before: false, after: true }],
        'curly': ['error', 'all'],
        'indent': ['error', 4, { SwitchCase: 1 }],
        'key-spacing': ['error', { afterColon: true, beforeColon: false }],
        'linebreak-style': ['error', 'unix'],
        'multiline-comment-style': ['error', 'starred-block'],
        'max-classes-per-file': ['error', 1],
        'no-multi-spaces': ['error'],
        'no-useless-escape': 0,
        'object-curly-spacing': ['error', 'always'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'space-in-parens': ['error', 'never'],
    },
};
