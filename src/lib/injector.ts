import { Subject } from 'rxjs';
import { TemplateResult, render } from 'lit-html';

export interface Provider<T> {
  tagName?: string;
  deps?: Provider<any>[];
  template?: (i: any) => TemplateResult;

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

export function Injectable(config: { deps?: Provider<any>[] } = {}) {
  return function(provider: Provider<any>) {
    provider.deps = config.deps;
  };
}

export function Component(config: {
  deps?: Provider<any>[];
  template(i: any): TemplateResult;
  tagName: string;
}) {
  return function(provider: Provider<any>) {
    provider.tagName = config.tagName;
    provider.deps = config.deps;
    provider.template = config.template;

    try {
      customElements.define(
        config.tagName,
        class extends HTMLElement {
          constructor() {
            super();
          }

          connectedCallback() {
            this.dispatchEvent(new CustomEvent('ELEMENT_CREATED'));
          }
        }
      );
    } catch (err) {}
  };
}

export class ChangeDetector {
  detectChanges() {}
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

  has(provider: Provider<any>): boolean {
    return this.providerMap.has(provider);
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
    } else if (this.parent && this.parent.has(provider)) {
      return this.parent.get(provider);
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

    if (!override && this.parent) {
    }

    const creator = override ? override.provider : provider;

    return creator.deps
      ? new creator(...creator.deps.map(dep => this.get(dep)))
      : new creator();
  }

  createComponent<T>(provider: Provider<T>) {
    if (!provider.template || !provider.tagName) {
      throw new Error('A component must have a tagname and a template');
    }

    const change = new Subject<void>();
    let instance: T;
    let element: HTMLElement;

    change.subscribe(() => {
      if (instance && provider.template) {
        render(provider.template(instance), element);
      }
    });

    const injector = new Injector(
      {
        providers: [
          {
            provide: ChangeDetector,
            provider: class ChangeDetectorRef implements ChangeDetector {
              detectChanges() {
                change.next();
              }
            }
          }
        ]
      },
      this
    );

    element = document.createElement(provider.tagName);

    element.addEventListener('ELEMENT_CREATED', e => {
      instance = injector.create(provider);

      if (provider.template) {
        render(provider.template(instance), element);
      }
    });

    return {
      elementInstance: element
    };
  }
}

export function renderComponent(
  component: Provider<any>,
  injector: Injector = new Injector()
) {
  const componentRef = injector.createComponent(component);

  document.body.appendChild(componentRef.elementInstance);
}
