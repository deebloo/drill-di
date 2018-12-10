import { Injector, Provider, Injectable } from 'drill-di';

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

    @Injectable({
      deps: [BarService]
    })
    class FooService {
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

    @Injectable({
      deps: [A]
    })
    class B {
      static deps = [A];

      constructor(private a: A) {}

      sayHello() {
        return this.a.sayHello() + '|';
      }
    }

    @Injectable({
      deps: [A, B]
    })
    class C {
      constructor(private a: A, private b: B) {}

      sayHello() {
        return this.a.sayHello() + '|' + this.b.sayHello();
      }
    }

    @Injectable({
      deps: [A, B, C]
    })
    class D {
      constructor(private a: A, private b: B, private c: C) {}

      sayHello() {
        return this.a.sayHello() + '|' + this.b.sayHello() + this.c.sayHello();
      }
    }

    @Injectable({
      deps: [D]
    })
    class E {
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

    @Injectable({
      deps: [BarService]
    })
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

    @Injectable({
      deps: [BarService]
    })
    class FooService {
      constructor(public bar: BarService) {}
    }

    const app = new Injector();

    expect(app.get(FooService).bar).toBe(app.get(BarService));
  });

  it('should return different instances', () => {
    class BarService {}

    @Injectable({
      deps: [BarService]
    })
    class FooService {
      constructor(public bar: BarService) {}
    }

    const app = new Injector();

    expect(app.create(FooService)).not.toBe(app.get(FooService));
  });

  it('should return an instance from a parent injector', () => {
    class BarService {}

    @Injectable({
      deps: [BarService]
    })
    class FooService {
      constructor(public bar: BarService) {}
    }

    const parent = new Injector();
    const child1 = new Injector({}, parent);
    const child2 = new Injector({}, child1);

    const app = new Injector({}, child2);

    expect(parent.get(FooService)).toBe(app.get(FooService));
  });

  it('should use the override in scope over everything else', () => {
    class BarService {}

    @Injectable({
      deps: [BarService]
    })
    class FooService {
      constructor(public bar: BarService) {}
    }

    const parent = new Injector();
    const child1 = new Injector({}, parent);
    const child2 = new Injector({}, child1);

    const app = new Injector(
      {
        providers: [
          {
            provide: FooService,
            provider: class extends FooService {}
          }
        ]
      },
      child2
    );

    expect(parent.get(FooService)).not.toBe(app.get(FooService));
  });
});
