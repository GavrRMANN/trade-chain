import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            'dist',
            'storybook-static',
            'node_modules',
            'commitlint.config.cjs',
            '.husky',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        // Стенд mock-API — обычный Node-скрипт, а не код приложения: без
        // объявленного окружения таймеры и process считаются необъявленными.
        files: ['mock-api/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            globals: globals.node,
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        },
    },
);
