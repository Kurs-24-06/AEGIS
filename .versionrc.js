// .versionrc.js
module.exports = {
    types: [
      { type: 'feat', section: 'Features' },
      { type: 'fix', section: 'Bug Fixes' },
      { type: 'chore', hidden: true },
      { type: 'docs', section: 'Documentation' },
      { type: 'style', hidden: true },
      { type: 'refactor', section: 'Code Refactoring' },
      { type: 'perf', section: 'Performance Improvements' },
      { type: 'test', hidden: true },
      { type: 'ci', hidden: true }
    ],
    commitUrlFormat: 'https://github.com/Kurs-24-06/aegis/commit/{{hash}}',
    compareUrlFormat: 'https://github.com/Kurs-24-06/aegis/compare/{{previousTag}}...{{currentTag}}'
  };