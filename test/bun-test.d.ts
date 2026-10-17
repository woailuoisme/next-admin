declare module "bun:test" {
  export const afterAll: (fn: () => unknown) => void;
  export const afterEach: (fn: () => unknown) => void;
  export const beforeAll: (fn: () => unknown) => void;
  export const beforeEach: (fn: () => unknown) => void;
  export const describe: (name: string, fn: () => void) => void;
  export const it: (name: string, fn: () => unknown) => void;
  export const test: (name: string, fn: () => unknown) => void;
  export const expect: any;
  export const mock: {
    module: (specifier: string, factory: () => unknown) => void;
    (fn?: (...args: any[]) => any): any;
  };
  export const spyOn: any;
}
