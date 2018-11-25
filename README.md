# drill-di [![CircleCI](https://circleci.com/gh/deebloo/drill-di.svg?style=svg)](https://circleci.com/gh/deebloo/drill-di)

Dependency Injection in ~800 bytes

#### Example:

```TS
import { Injector } from 'drill-di';

// Write a plain ol JS class
class FooService {
  sayHello() {
    return 'Hello From FooService';
  }
}

// Declare that class as a static dependency of another class
class BarService {
  static deps = [FooService];

  // and instance of that class will be passed to this one;
  constructor(private foo: FooService) {}

  sayHello() {
    return 'Hello From BarService and ' + this.foo.sayHello();
  }
}

// create a new instance of our injector
const app = new Injector();

// Use that injector to create new instances of objects
app.get(BarService).sayHello(); // Hello from BarService and Hello from FooService
```

#### Multi Providers:

```TS
import { Injector, Multi } from 'drill-di';

interface MiddleWare {
  sayHello(): string;
}

// define a vanilla token
class MiddleWareToken {}

// write implementations
class FirstMiddleWare implements MiddleWare {
  sayHello() {
    return 'Hello From First';
  }
}
class SecondMiddleWare implements MiddleWare {
  sayHello() {
    return 'Hello From Second';
  }
}

// create a new instance of our injector
const app = new Injector({
  providers: [Multi(MiddleWare, [FirstMiddleWare, SecondMiddleWare])]
});

// Use that injector to create new instances of objects
app.get(MiddleWareToken).providers.forEach(instance => {
  console.log(instance.sayHello());
});
```
