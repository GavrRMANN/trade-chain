import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    plugins: [react(), svgr()],
    test: {
        /* Иконки в тестах подменяются заглушкой: превращать SVG в компонент
           умеет только плагин сборки, и без подмены на его импорте разваливался
           весь модуль — вместе с чистыми функциями, которые тест и проверяет. */
        alias: [
            {
                // Шаблон покрывает путь целиком: подстановка заменяет только
                // совпавшую часть, и хвостовой `.svg?react` превратил бы
                // импорт в путь вида `icons/ArrowUp<путь к заглушке>`.
                find: /^.*\.svg\?react$/,
                replacement: fileURLToPath(
                    new URL('./src/shared/testing/SvgStub.tsx', import.meta.url),
                ),
            },
        ],
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
            '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
            '@widgets': fileURLToPath(new URL('./src/widgets', import.meta.url)),
            '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
            '@entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
            '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
        },
    },
});
