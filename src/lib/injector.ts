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
    if (this.providerMap.has(provider)) {
      return this.providerMap.get(provider);
    }

    const instance = this.create(provider);

    this.providerMap.set(provider, instance);

    return instance;
  }

  /**
   * Creates a new instance of a provider.
   *
   * NOTE: in most cases you will want to use Injector.get instead
   *
   * @param provider A provider to create an instance of
   */
  create<T>(provider: Provider<T>): T {
    const overrideProvider = this.opts.overrides
      ? this.opts.overrides.find(override => override.provide === provider)
      : null;

    const creator = overrideProvider || provider;

    if (creator.deps) {
      const deps = creator.deps.map(dep => this.create(dep));

      return creator.factory ? creator.factory(...deps) : new provider(...deps);
    }

    return creator.factory ? creator.factory() : new provider();
  }
}
