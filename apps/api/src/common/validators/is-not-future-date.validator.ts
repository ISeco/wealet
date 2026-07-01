import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotFutureDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          const todayISO = new Date().toISOString().slice(0, 10);
          return value <= todayISO;
        },
        defaultMessage() {
          return `${propertyName} cannot be a future date`;
        },
      },
    });
  };
}
