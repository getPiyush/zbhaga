module.exports = {
  default: {
    require: [
      'tests/e2e/step-definitions/**/*.ts',
      'tests/e2e/support/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:cucumber-report.html',
      'json:cucumber-report.json',
      'junit:cucumber-report.xml'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    worldParameters: {
      appUrl: process.env.APP_URL || 'http://localhost:8081',
      apiUrl: process.env.API_URL || 'http://localhost:4000'
    }
  }
};
