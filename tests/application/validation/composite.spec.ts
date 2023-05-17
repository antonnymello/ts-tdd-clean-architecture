import { type MockProxy, mock } from "jest-mock-extended";

interface Validator {
  validate: () => Error | undefined;
}

class ValidationComposite {
  constructor(private readonly validators: Validator[]) {}

  validate(): undefined {
    return undefined;
  }
}

describe("ValidationComposite", () => {
  let sut: ValidationComposite;
  let validator1: MockProxy<Validator>;
  let validator2: MockProxy<Validator>;
  let validators: Validator[];

  beforeAll(() => {
    validator1 = mock<Validator>();
    validator1.validate.mockReturnValue(undefined);
    validator2 = mock<Validator>();
    validator2.validate.mockReturnValue(undefined);
    validators = [validator1, validator2];
  });

  beforeEach(() => {
    sut = new ValidationComposite(validators);
  });

  it("should return undefined if all Validators return undefined", () => {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    const result = sut.validate();

    expect(result).toBeUndefined();
  });
});
