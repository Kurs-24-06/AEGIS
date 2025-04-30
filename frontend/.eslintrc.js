module.exports = {
    root: true,
    overrides: [
      {
        files: ["*.ts"],
        parserOptions: {
          project: ["tsconfig.json"],
          createDefaultProgram: true
        },
        extends: [
          "plugin:@typescript-eslint/recommended",
          "plugin:prettier/recommended"
        ],
        rules: {
          "@typescript-eslint/explicit-function-return-type": ["warn", {
            allowExpressions: true,
            allowTypedFunctionExpressions: true
          }],
          "@typescript-eslint/no-explicit-any": "warn",
          "@typescript-eslint/no-unused-vars": ["error", { 
            argsIgnorePattern: "^_"
          }],
          "prettier/prettier": ["error", {
            "endOfLine": "auto"
          }]
        }
      },
      {
        files: ["*.html"],
        extends: [
          "plugin:prettier/recommended"
        ]
      }
    ]
  }