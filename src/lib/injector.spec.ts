import { Injector } from './injector';

test('it should create a new instance of a single provider', () => {
  class MyService {
    foo = 'Hello World';
  }

  const app = new Injector();

  expect(app.get(MyService).foo).toBe('Hello World');
});

test('it should create a new instance of a provider with a dependency', () => {
  class BarService {
    foo = 'Hello World';
  }

  class FooService {
    static deps = [BarService];

    constructor(private bar: BarService) {}

    sayHello() {
      return this.bar.foo;
    }
  }

  const app = new Injector();

  expect(app.get(FooService).sayHello()).toBe('Hello World');
});

test('it should create a new instance of a provider that has a full dep tree', () => {
  class A {
    sayHello() {
      return '|';
    }
  }

  class B {
    static deps = [A];

    constructor(private a: A) {}

    sayHello() {
      return this.a.sayHello() + '|';
    }
  }

  class C {
    static deps = [A, B];

    constructor(private a: A, private b: B) {}

    sayHello() {
      return this.a.sayHello() + '|' + this.b.sayHello();
    }
  }

  class D {
    static deps = [A, B, C];

    constructor(private a: A, private b: B, private c: C) {}

    sayHello() {
      return this.a.sayHello() + '|' + this.b.sayHello() + this.c.sayHello();
    }
  }

  class E {
    static deps = [D];

    constructor(private d: D) {}

    sayHello() {
      return this.d.sayHello() + '|';
    }
  }

  const app = new Injector();

  expect(app.get(E).sayHello()).toBe('|||||||||');
});

test('it should override a provider if explicitly instructed', () => {
  class BarService {
    foo = 'Hello World';
  }

  class FooService {
    static deps = [BarService];

    constructor(private bar: BarService) {}

    sayHello() {
      return this.bar.foo;
    }
  }

  const app = new Injector({
    overrides: [
      {
        provide: BarService,
        factory: () => ({ foo: 'Goodbye World' } as BarService)
      }
    ]
  });

  expect(app.get(FooService).sayHello()).toBe('Goodbye World');
});

test('it immediately initialize specified providers', () => {
  class BarService {
    initialized = false;

    constructor() {
      this.initialized = true;
    }
  }

  class FooService {
    initialized = false;

    constructor() {
      this.initialized = true;
    }
  }

  const app = new Injector({ bootstrap: [FooService, BarService] });

  expect(app.get(FooService).initialized).toBe(true);
  expect(app.get(BarService).initialized).toBe(true);
});

test('it should use the provided factory method if it exists', () => {
  class FooService {
    static factory() {
      return 'Hello World';
    }
  }

  const app = new Injector();

  expect(app.get<any>(FooService) as string).toBe('Hello World');
});

test('it should return the same instance when called', () => {
  class BarService {}

  class FooService {
    static deps = [BarService];

    constructor(public bar: BarService) {}
  }

  const app = new Injector();

  expect(app.get(FooService).bar).toBe(app.get(BarService));
});

test('it should return different instances', () => {
  class BarService {}

  class FooService {
    static deps = [BarService];

    constructor(public bar: BarService) {}
  }

  expect(new Injector().get(FooService).bar).not.toBe(
    new Injector().get(BarService)
  );
});
