import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'server/node_modules', '.mimocode']),
  {
    // ---- Browser / React (the Vite frontend) -----------------------------
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^[A-Z_]' }],
      // AnimatedIcon.jsx exports the ICONS path map alongside its components.
      // That is a plain constant, not a component, so fast refresh is fine.
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
      // These are React Compiler advisory rules. The data-fetching effects in
      // this app legitimately call setState after an await, which the rule
      // cannot distinguish from a cascading-render bug. Downgraded to warnings
      // so they stay visible without blocking CI.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
    },
  },
  {
    // ---- Server runtime (Express + Vercel serverless functions) ----------
    //
    // This block did not exist before, so every `process.env` reference in
    // api/ and server/ was reported as "'process' is not defined". That noise
    // (14+ errors on its own) is part of how a fatal syntax error in
    // api/_lib/cors.js shipped undetected.
    files: ['api/**/*.js', 'server/**/*.js', 'shared/**/*.js', '*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_|^next$' }],

      // `authenticate` has ONE correct shape — Express middleware (req,res,next).
      // Calling it with anything else is always wrong.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.name='authenticate'][arguments.length!=3]",
          message:
            "authenticate() is Express middleware and must be called with (req, res, next).",
        },
      ],
    },
  },
  {
    // ---- Auth guard shapes ----------------------------------------------
    //
    // Two incompatible shapes exist, and mixing them up ships silently:
    //   server/routes/*  requireAdmin   (req,res,next) -> middleware, must next()
    //   server/routes/*  authorizeAdmin (req,res)      -> handler, returns user|null
    //   api/*            requireAdmin   (req,res)      -> handler, returns user|null
    //
    // A middleware passed where a handler is expected throws
    // "next is not a function". A handler passed as middleware hangs the
    // request forever. Both shipped in this repo, so both directions are now
    // enforced per directory.
    files: ['server/**/*.js'],
    ignores: ['server/middleware/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          // In server/, requireAdmin must be middleware (3 args).
          selector:
            "CallExpression[callee.name='requireAdmin'][arguments.length!=3]",
          message:
            "In server/, requireAdmin is MIDDLEWARE: pass it to router.put('/', requireAdmin, handler) or call it as requireAdmin(req, res, next). To use the handler form inside a handler, call authorizeAdmin(req, res) instead.",
        },
        {
          // ...and authorizeAdmin must be the handler form (2 args).
          selector:
            "CallExpression[callee.name=/^authorize(Admin|User)$/][arguments.length!=2]",
          message:
            "authorizeAdmin/authorizeUser are HANDLERS taking (req, res). They never call next() — using them as middleware hangs the request.",
        },
      ],
    },
  },
  {
    files: ['api/**/*.js'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          // In api/, requireAdmin is always the handler form (2 args).
          selector:
            "CallExpression[callee.name='requireAdmin'][arguments.length!=2]",
          message:
            "In api/, requireAdmin is the HANDLER form: call it as requireAdmin(req, res) and `if (!user) return;`. The Express middleware form does not exist here.",
        },
      ],
    },
  },
  {
    // Seed scripts use top-level await, which needs an ESM-capable parser.
    files: ['server/seed*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
])
