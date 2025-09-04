function createStorage() {
  const UNSET = Symbol();
  const noopCallback = (..._args: any) => {};
  let _itemInsertionCallback = noopCallback;
  const defaultS: Storage = {
    setItem: () => {},
    getItem: () => null,
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
    itemInsertionCallback: () => {},
  };
  let s: Storage = { ...defaultS };

  Object.defineProperty(s, 'setItem', {
    get: () => {
      return (k, v = UNSET) => {
        if (v === UNSET) {
          throw new TypeError(`Failed to execute 'setItem' on 'Storage': 2 arguments required, but only 1 present.`);
        }
        if (!s.hasOwnProperty(String(k))) {
          _itemInsertionCallback(s.length);
        }
        s[String(k)] = String(v);
      };
    },
  });

  Object.defineProperty(s, 'getItem', {
    get: () => {
      return (k) => {
        return s.hasOwnProperty(String(k)) ? s[String(k)] : null;
      };
    },
  });

  Object.defineProperty(s, 'removeItem', {
    get: () => {
      return (k) => {
        if (s.hasOwnProperty(String(k))) {
          delete s[String(k)];
        }
      };
    },
  });

  Object.defineProperty(s, 'clear', {
    get: () => {
      return () => {
        s = { ...defaultS };
        // for (const k in s) {
        //   delete s[String(k)];
        // }
      };
    },
  });

  Object.defineProperty(s, 'length', {
    get: () => {
      return Object.keys(s).length;
    },
  });

  Object.defineProperty(s, 'key', {
    value: (k) => {
      const key = Object.keys(s)[String(k)];
      return key ? key : null;
    },
  });

  Object.defineProperty(s, 'itemInsertionCallback', {
    get: () => {
      return _itemInsertionCallback;
    },
    set: (v) => {
      if (!v || typeof v != 'function') {
        v = noopCallback;
      }
      _itemInsertionCallback = v;
    },
  });

  return s;
}

const globalScope =
  typeof globalThis === 'undefined' ? (typeof globalThis === 'undefined' ? globalThis : globalThis) : globalThis;

const mockStorage = (): (() => void) => {
  const originalStorage = globalScope.Storage;
  const originalLocalStorage = globalScope.localStorage;
  const originalSessionStorage = globalScope.sessionStorage;

  Object.defineProperty(globalThis, 'Storage', {
    value: createStorage,
    writable: true,
  });
  Object.defineProperty(globalThis, 'Storage', {
    value: createStorage,
    writable: true,
  });

  Object.defineProperty(globalThis, 'localStorage', {
    value: createStorage(),
    writable: true,
  });
  Object.defineProperty(globalThis, 'localStorage', {
    value: globalThis.localStorage,
    writable: true,
  });

  Object.defineProperty(globalThis, 'sessionStorage', {
    value: createStorage(),
    writable: true,
  });
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: globalThis.sessionStorage,
    writable: true,
  });

  return () => {
    globalScope.Storage = originalStorage;
    globalScope.localStorage = originalLocalStorage;
    globalScope.sessionStorage = originalSessionStorage;
  };
};

export default mockStorage;
