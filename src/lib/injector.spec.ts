import { Injector, Provider, Multi, MultiProvider } from './injector';

describe('Injector', () => {
  it('should create a new instance of a single provider', () => {
    class MyService {
      foo = 'Hello World';
    }

    const app = new Injector();

    expect(app.get(MyService).foo).toBe('Hello World');
  });

  it('should create a new instance of a provider with a dependency', () => {
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

  it('should create a new instance of a provider that has a full dep tree', () => {
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

  it('should override a provider if explicitly instructed', () => {
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

    expect(new Injector().get(FooService).sayHello()).toBe('Hello World');

    expect(
      new Injector({
        providers: [
          {
            provide: BarService,
            provider: class implements BarService {
              foo = 'Goodbye World';
            }
          }
        ]
      })
        .get(FooService)
        .sayHello()
    ).toBe('Goodbye World');
  });

  it('immediately initialize specified providers', () => {
    const initialized: Provider<any>[] = [];

    class BarService {
      constructor() {
        initialized.push(BarService);
      }
    }

    class FooService {
      constructor() {
        initialized.push(FooService);
      }
    }

    new Injector({ bootstrap: [FooService, BarService] });

    expect(initialized).toEqual([FooService, BarService]);
  });

  it('should return the same instance when called', () => {
    class BarService {}

    class FooService {
      static deps = [BarService];

      constructor(public bar: BarService) {}
    }

    const app = new Injector();

    expect(app.get(FooService).bar).toBe(app.get(BarService));
  });

  it('should return different instances', () => {
    class BarService {}

    class FooService {
      static deps = [BarService];

      constructor(public bar: BarService) {}
    }

    const app = new Injector();

    expect(app.create(FooService)).not.toBe(app.create(FooService));
  });

  it('should allow a multi providers usage', () => {
    class MiddleWareProvider {}
    class MiddleWare1 {}
    class MiddleWare2 {}

    class MyService {
      static deps = [MiddleWareProvider];

      constructor(public middleware: MultiProvider<any>) {}
    }

    const app = new Injector({
      providers: [Multi(MiddleWareProvider, [MiddleWare1, MiddleWare2])]
    });

    expect(app.get(MyService).middleware.providers).toEqual([
      new MiddleWare1(),
      new MiddleWare2()
    ]);
  });
});
