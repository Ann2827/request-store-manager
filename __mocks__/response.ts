const globalScope =
  typeof globalThis === 'undefined' ? (typeof globalThis === 'undefined' ? globalThis : globalThis) : globalThis;

class HeadersFakeClass {
  private prototype: HeadersInit;

  constructor(init?: HeadersInit) {
    this.prototype = init || {};
  }

  append(name: string, value: string): void {
    this.prototype = {
      ...this.prototype,
      [name]: value,
    };
  }

  delete(name: string): void {
    this.prototype = Object.fromEntries(Object.entries(this.prototype).filter(([key]) => key !== name));
  }

  get(name: string): string | null {
    if (!(name in this.prototype)) return null;
    return Object.entries(this.prototype).find(([key]) => key === name)?.[1] || null;
  }

  has(name: string): boolean {
    return Boolean(name in this.prototype);
  }

  set(name: string, value: string): void {
    this.append(name, value);
  }

  forEach(callbackfn: (value: string, key: string, parent: Headers) => void, thisArg?: any): void {}
}

class ResponseFakeClass {
  private readonly prototype: Response;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.prototype = {
      body: body as ReadableStream,
      bodyUsed: Boolean(body),
      headers: new HeadersFakeClass(init?.headers),
      ok: Math.trunc((init?.status || 200) / 100) === 2,
      redirected: false,
      status: init?.status || 200,
      statusText: init?.statusText || '',
      type: 'default',
      url: '',
    } as unknown as Response;
    this.json = this.json.bind(this);
    this.text = this.text.bind(this);
    return { ...this, ...this.prototype };
  }

  error(): Response {
    return this.prototype;
  }

  redirect(url: string | URL, status?: number): Response {
    const u = new URL(url);
    return {
      ...this.prototype,
      url: u.href,
      status: status || 200,
      ok: Math.trunc((status || 200) / 100) === 2,
      redirected: true,
    };
  }

  clone(): Response {
    return { ...this.prototype };
  }

  async json(): Promise<any> {
    const body = this.prototype.body;
    let result = '';
    if (typeof body !== 'string' && !!body) {
      const reader = body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result = result + (value as unknown as string);
        }
      } catch (error) {
        console.error(error);
      }
      // reader.releaseLock();
    } else result = body || '';

    let parsed = {};
    try {
      parsed = JSON.parse(result);
    } catch (error) {
      console.error(error);
    }

    return parsed;
  }

  async text(): Promise<string> {
    const body = this.prototype.body;
    let result = '';
    if (typeof body !== 'string' && !!body) {
      const reader = body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) return result;
          result = result + value.toString();
        }
      } catch (error) {
        console.error(error);
      }
    } else result = body || '';
    return body as unknown as string;
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return new Promise((resolve) => {
      resolve([] as unknown as ArrayBuffer);
    });
  }

  blob(): Promise<Blob> {
    return new Promise((resolve) => {
      resolve({} as unknown as Blob);
    });
  }

  formData(): Promise<FormData> {
    return this.json();
  }
}

const mockResponse = (): (() => void) => {
  const originalResponse = undefined;
  const originalHeaders = undefined;

  globalScope.Response = ResponseFakeClass as unknown as typeof Response;
  globalScope.Headers = HeadersFakeClass as unknown as typeof Headers;

  return () => {
    globalScope.Headers = originalHeaders as unknown as typeof Headers;
    globalScope.Response = originalResponse as unknown as typeof Response;
  };
};

export default mockResponse;
