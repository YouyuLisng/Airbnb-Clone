module.exports = {
  plugins: {
    // Resolves bare-specifier `@import "package-name";` CSS at-rules
    // (e.g. tw-animate-css) against node_modules -- must run before
    // tailwindcss so the imported rules are in place for it to process.
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}
