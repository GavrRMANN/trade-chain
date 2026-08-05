module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'fix',
                'feat',
                'refactor',
                'docs',
                'test',
                'style',
                'chore',
                'build',
                'ci',
                'perf',
                'revert',
            ],
        ],
        'type-empty': [2, 'never'],
        'scope-empty': [2, 'never'],
        'subject-empty': [2, 'never'],
    },
};
