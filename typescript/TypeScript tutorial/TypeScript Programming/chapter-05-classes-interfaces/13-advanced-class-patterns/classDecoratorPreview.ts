// Goal:
// preview a class decorator as a runtime function call.

// Expected result:
// This file requires experimentalDecorators

function sealed<ClassType extends abstract new (...args: any[]) => any>(
  value: ClassType,
  context: ClassDecoratorContext<ClassType>,
): void {
  context.addInitializer(function () {
    Object.seal(this);
    Object.seal(this.prototype);
  });
}

@sealed
class PaymentProcessor {
  process(): string {
    return "processed";
  }
}

const processor = new PaymentProcessor();

console.log(processor.process());