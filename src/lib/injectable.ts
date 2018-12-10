import { Provider } from './provider';

export interface InjectableConfig {
  deps?: Provider<any>[];
}

export function Injectable(config: InjectableConfig = { deps: [] }) {
  return function(provider: Provider<any>) {
    provider.deps = config.deps;
  };
}
