const defaultKeys = ['log', 'warn', 'error'];

const mockConsole = (mockArg?: unknown) => {
  const originalConsole = { ...console };
  // No argument
  if (!mockArg) {
    defaultKeys.forEach((key) => {
      globalThis.console[key] = jest.fn();
    });
  }
  // Argument is a string
  else if (typeof mockArg === 'string' || mockArg instanceof String) {
    globalThis.console[mockArg] = jest.fn();
  }
  // Argument is an array
  else if (Array.isArray(mockArg)) {
    mockArg.forEach((key) => {
      globalThis.console[key] = jest.fn();
    });
  }
  // Argument is an object
  else {
    Object.keys(mockArg).forEach((key) => {
      globalThis.console[key] = mockArg[key];
    });
  }
  // Return function to restore console
  return () => {
    globalThis.console = originalConsole;
  };
};

export default mockConsole;
