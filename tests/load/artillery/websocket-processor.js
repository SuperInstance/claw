// Artillery Processor for WebSocket Tests
// Generates test data and handles complex logic

module.exports = {
  // Generate random number in range
  randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Generate random string
  randomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Generate timestamp
  timestamp() {
    return Date.now();
  },

  // Generate random color
  randomColor() {
    const colors = ['#FF5722', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  // Generate test token
  testToken() {
    return `test-token-${this.randomString(32)}`;
  },

  // Generate user ID
  userId() {
    return `user-${this.randomNumber(1, 10000)}`;
  },

  // Generate spreadsheet ID
  spreadsheetId() {
    const spreadsheetIds = [
      'test-spreadsheet-1',
      'test-spreadsheet-2',
      'test-spreadsheet-3',
      'test-spreadsheet-4',
      'test-spreadsheet-5',
    ];
    return spreadsheetIds[this.randomNumber(0, spreadsheetIds.length - 1)];
  },

  // Before request hook
  beforeRequest(requestContext, events, done) {
    // Add any preprocessing logic here
    return done();
  },

  // After response hook
  afterResponse(requestContext, events, done) {
    // Add any postprocessing logic here
    return done();
  }
};
