import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { getLocalDateISO } from "./utils";

describe("getLocalDateISO", () => {
  let originalDate: DateConstructor;

  beforeEach(() => {
    originalDate = global.Date;
  });

  afterEach(() => {
    global.Date = originalDate;
  });

  it("should return the correct local date string when UTC is next day but local is previous day (UTC-3)", () => {
    const mockDateValue = new Date("2023-10-05T02:00:00.000Z");

    class MockDate extends Date {
      constructor(value?: string | number | Date) {
        if (value !== undefined) {
          super(value as any);
        } else {
          super(mockDateValue.getTime());
        }
      }
      getTimezoneOffset() {
        return 180; // UTC-3
      }
    }

    global.Date = MockDate as unknown as DateConstructor;

    expect(getLocalDateISO()).toBe("2023-10-04");
  });

  it("should return the correct local date string when UTC is previous day but local is next day (UTC+2)", () => {
    const mockDateValue = new Date("2023-10-05T23:00:00.000Z");

    class MockDate extends Date {
      constructor(value?: string | number | Date) {
        if (value !== undefined) {
          super(value as any);
        } else {
          super(mockDateValue.getTime());
        }
      }
      getTimezoneOffset() {
        return -120; // UTC+2
      }
    }

    global.Date = MockDate as unknown as DateConstructor;

    expect(getLocalDateISO()).toBe("2023-10-06");
  });

  it("should handle UTC offset 0 correctly", () => {
    const mockDateValue = new Date("2023-10-05T12:00:00.000Z");

    class MockDate extends Date {
      constructor(value?: string | number | Date) {
        if (value !== undefined) {
          super(value as any);
        } else {
          super(mockDateValue.getTime());
        }
      }
      getTimezoneOffset() {
        return 0; // UTC+0
      }
    }

    global.Date = MockDate as unknown as DateConstructor;

    expect(getLocalDateISO()).toBe("2023-10-05");
  });
});
