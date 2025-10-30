// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      ".angular/**",
      "coverage/**",
      "**/*.js.map",
      "**/*.d.ts",
      ".eslintcache",
    ],
  },
  // Base ESLint and TypeScript configs for .ts files
  {
    files: ["**/*.ts"],
    ...eslint.configs.recommended,
  },
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ["**/*.ts"],
  })),
  ...tseslint.configs.stylistic.map(config => ({
    ...config,
    files: ["**/*.ts"],
  })),
  ...angular.configs.tsRecommended.map(config => ({
    ...config,
    files: ["**/*.ts"],
  })),
  {
    files: ["**/*.ts"],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      "@angular-eslint/no-empty-lifecycle-method": "warn",
      "@angular-eslint/no-output-native": "error",
      "@angular-eslint/no-output-on-prefix": "error",
      "@angular-eslint/use-lifecycle-interface": "error",
      "@angular-eslint/prefer-on-push-component-change-detection": "warn",
      
      // TypeScript-specific rules
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "enumMember",
          format: ["PascalCase", "UPPER_CASE"],
        },
        {
          selector: "property",
          format: null, // Allow any format for properties (e.g., API responses)
        },
      ],
      
      // General code quality
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "curly": "error",
      "no-throw-literal": "error",
    },
  },
  // Template configs for .html files
  ...angular.configs.templateRecommended.map(config => ({
    ...config,
    files: ["**/*.html"],
  })),
  ...angular.configs.templateAccessibility.map(config => ({
    ...config,
    files: ["**/*.html"],
  })),
  {
    files: ["**/*.html"],
    rules: {
      "@angular-eslint/template/click-events-have-key-events": "warn",
      "@angular-eslint/template/interactive-supports-focus": "warn",
      "@angular-eslint/template/no-autofocus": "warn",
      "@angular-eslint/template/label-has-associated-control": "warn",
    },
  },
  // Spec file overrides
  {
    files: ["**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
