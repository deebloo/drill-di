# Drill [![CircleCI](https://circleci.com/gh/deebloo/drill.svg?style=svg)](https://circleci.com/gh/deebloo/drill)

super small DI implementation

#### Example:

```TS
import { Injector } from 'drill';

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
