export interface Provider<T> {
  deps?: Provider<any>[];

  new (...args: any[]): T;
}

export interface OverrideProvider<T> {
  provide: Provider<T>;
  provider: Provider<T>;
}

export interface InjectorOptions {
  providers?: OverrideProvider<any>[];
  bootstrap?: Provider<any>[];
}

export interface MultiProvider<T> {
  providers: T[];
}

export function Multi<T = any>(
  provide: Provider<any>,
  providers: Provider<T>[]
): OverrideProvider<any> {
  return {
    provide: provide,
    provider: class implements MultiProvider<T> {
      static deps = providers;

      providers: any[] = [];

      constructor(...args: any[]) {
        this.providers = args;
      }
    }
  };
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

    const instance = this.create(provider);

    // cache the result in the WeakMap
    this.providerMap.set(provider, instance);

    return instance;
  }

  /**
   * Create a new instance of a provider
   *
   * @param provider A provider to create an instance of
   */
  create<T>(provider: Provider<T>): T {
    // Check if there is an override defined in the Injector instance
    const override = this.opts.providers
      ? this.opts.providers.find(override => override.provide === provider)
      : null;

    const creator = override ? override.provider : provider;

    return creator.deps
      ? new creator(...creator.deps.map(dep => this.get(dep)))
      : new creator();
  }
}
