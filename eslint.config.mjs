// @ts-check
import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
    eslint.configs.recommended,
    {
        ignores: ['dist/**', 'node_modules/**', 'eslint.config.mjs'],
    },
    {
        
        files: ['src/**/*.ts'],
        languageOptions: {
            globals:{
            console:'readonly'
            },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },rules:{
            ...tseslint.configs.recommendedTypeChecked.rules,
        }
    },
)
