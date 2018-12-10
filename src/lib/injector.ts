import { Provider, OverrideProvider } from './provider';

export interface InjectorOptions {
  providers?: OverrideProvider<any>[];
  bootstrap?: Provider<any>[];
}

/**
 * Create an instance of a Dependency injector.
 * Can be used to create a singleton of any class that is property annotated with dependencies.
 *
 * @param overrides a list of explicit providers, if you need to override a provider at any point in the tree
 */
export class Injector {
  private providerMap = new WeakMap<Provider<any>, any>();

  constructor(
    private opts: InjectorOptions = { providers: [] },
    private parent?: Injector
  ) {
    if (this.opts.bootstrap) {
      this.opts.bootstrap.forEach(provider => this.get(provider));
    }
  }

  /**
   * recursively check if a singleton instance is available for a provider
   *
   */
  has(provider: Provider<any>): boolean {
    if (!this.parent) {
      return this.providerMap.has(provider);
    } else {
      return this.parent.has(provider);
    }
  }

  /**
   * fetches a singleton instance of a provider
   */
  get<T>(provider: Provider<T>): T {
    if (this.providerMap.has(provider)) {
      // if provider has already been created in this scope return it
      return this.providerMap.get(provider);
    } else {
      const override = this.findOverride(provider);

      if (override) {
        // if an override is available for this Injector use that
        return this.createSingleton(override.provider);
      } else if (this.parent && this.parent.has(provider)) {
        // if a parent is available and contains an instance of the provider already use that
        return this.parent.get(provider);
      }
    }

    return this.createSingleton(provider);
  }

  /**
   * Create a new instance of a provider
   */
  create<T>(provider: Provider<T>): T {
    return provider.deps
      ? new provider(...provider.deps.map(dep => this.get(dep)))
      : new provider();
  }

  private createSingleton(provider: Provider<any>) {
    const instance = this.create(provider);

    // cache the result in the WeakMap
    this.providerMap.set(provider, instance);

    return instance;
  }

  private findOverride(provider: Provider<any>): OverrideProvider<any> | null {
    if (this.opts.providers) {
      const override = this.opts.providers.find(
        override => override.provide === provider
      );

      return override || null;
    }

    return null;
  }
}
