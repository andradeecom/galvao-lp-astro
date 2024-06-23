/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-astro"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
        semi: true,
        singleQuote: true,
        trailingComma: "all",
        tabWidth: 4,
        bracketSpacing: true,
        bracketSameLine: false,
        arrowParens: "always",
      },
    },
  ],
};
