export interface Provider<T> {
  deps?: Provider<any>[];

  new (...args: any[]): T;
}

export interface OverrideProvider<T> {
  provide: Provider<T>;
  provider: Provider<T>;
}
