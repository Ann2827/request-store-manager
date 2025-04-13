const globalScope =
  typeof globalThis === 'undefined' ? (typeof globalThis === 'undefined' ? globalThis : globalThis) : globalThis;

const mockFetch = (): (() => void) => {
  const originalFetch: typeof fetch | undefined = globalScope?.fetch ? globalScope.fetch.bind(globalScope) : undefined;

  globalScope.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    return new Promise((res) => {
      setTimeout(() => {
        res(new Response());
      }, 1000);
    });
  };

  return () => {
    // @ts-ignore
    globalScope.fetch = originalFetch;
  };
};

export default mockFetch;
