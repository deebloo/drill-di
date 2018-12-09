import { html } from 'lit-html';

import {
  Component,
  ChangeDetector,
  renderComponent,
  Injector
} from '../lib/injector';

const app = new Injector();

@Component({
  tagName: 'test-element',
  template: (c: TestComponent) => html`
    ${c.title}

    <button @click="${() => c.changeTitle()}">Change Title</button>
  `,
  deps: [ChangeDetector]
})
export class TestComponent {
  title = 'Hello World';

  constructor(private cd: ChangeDetector) {}

  changeTitle() {
    this.title = 'Goodbye World';

    this.cd.detectChanges();
  }
}

@Component({
  tagName: 'my-element',
  template: (c: MyComponent) => html`
    <button @click="${() => c.decrement()}">-</button>

    ${c.counter}

    <button @click="${() => c.increment()}">+</button>

    <br /><br />

    <test-element></test-element>
  `,
  deps: [ChangeDetector]
})
class MyComponent {
  counter = 0;

  constructor(private cd: ChangeDetector) {}

  increment() {
    this.counter++;

    this.cd.detectChanges();
  }

  decrement() {
    this.counter--;

    this.cd.detectChanges();
  }
}

renderComponent(MyComponent, app);
