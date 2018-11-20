export interface Provider<T> {
  deps?: Provider<any>[];
  factory?: (...args: any[]) => T;

  new (...args: any[]): T;
}

export interface OverrideProvider {
  provide: Provider<any>;
  factory(...args: any[]): any;
  deps?: Provider<any>[];
}

export interface InjectorOptions {
  overrides?: OverrideProvider[];
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
    const overrideProvider = this.opts.overrides
      ? this.opts.overrides.find(override => override.provide === provider)
      : null;

    const creator = overrideProvider || provider;

    let instance: T;

    // if there are dependencies recursively call Injector.get
    if (creator.deps) {
      const deps = creator.deps.map(dep => this.get(dep));

      instance = creator.factory
        ? creator.factory(...deps)
        : new provider(...deps);
    } else {
      instance = creator.factory ? creator.factory() : new provider();
    }

    // cache the result in the WeakMap
    this.providerMap.set(provider, instance);

    return instance;
  }
}
