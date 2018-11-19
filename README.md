# Drill [![CircleCI](https://circleci.com/gh/deebloo/drill.svg?style=svg)](https://circleci.com/gh/deebloo/drill)

super small DI implementation

#### Example:
```TS
import { Injector } from 'drill';

class FooService {
  sayHello() {
    return 'Hello From FooService'; 
  }
}

class BarService {
  static deps = [FooService];
  
  constructor(private foo: FooService) {}
  
  sayHello() {
    return 'Hello From BarService and ' + this.foo.sayHello();
  }
}

const app = new Injector();

app.get(BarService).sayHello(); // Hello from BarService and Hello from FooService
```
