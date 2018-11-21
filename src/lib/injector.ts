export interface Provider<T> {
  deps?: Provider<any>[];
  factory?: (...args: any[]) => T;

  new (...args: any[]): T;
}

export interface OverrideProvider<T> {
  provide: Provider<T>;
  provider: Provider<T>;
}

export interface InjectorOptions {
  provide?: OverrideProvider<any>[];
  bootstrap?: Provider<any>[];
}

/**
 * @param overrides a list of explicit providers, if you need to override a provider at any point in the tree
 */
export class Injector {
  private providerMap = new WeakMap<Provider<any>, any>();

  constructor(private opts: InjectorOptions = {}) {
    if (this.opts.bootstrap) {
      this.opts.bootstrap.forEach(provider => this.get(provider));
    }
  }

  /**
   * fetches a singleton instance of a provider
   *
   * @param provider A provider to create an instance of
   */
  get<T>(provider: Provider<T>): T {
    // if provider has already been created return it
    if (this.providerMap.has(provider)) {
      return this.providerMap.get(provider);
    }

    // Check if there is an override defined in the Injector instance
    const override = this.opts.provide
      ? this.opts.provide.find(override => override.provide === provider)
      : null;

    const creator = override ? override.provider : provider;

    const instance = creator.deps
      ? new creator(...creator.deps.map(dep => this.get(dep)))
      : new creator();

    // cache the result in the WeakMap
    this.providerMap.set(provider, instance);

    return instance;
  }
}
