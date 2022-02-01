import LoggerService from "@/services/LoggerService";

describe("LoggerService", () => {
  describe("error", () => {
    const testError = new Error("Test error message");
    beforeEach(() => {
      jest.clearAllMocks();
      console.error = jest.fn();
    });

    it("creates an error in the console and returns a toast message", () => {
      const result = LoggerService.error("Test error toast", testError);
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(testError);
      expect(result).toStrictEqual({ severity: "error", summary: "Error", detail: "Test error toast", life: 3000 });
    });

    it("creates an error in the console no return toast message", () => {
      const result = LoggerService.error(undefined, testError);
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(testError);
      expect(result).toBeUndefined();
    });

    it("returns a toast message, no console", () => {
      const result = LoggerService.error("Test error toast");
      expect(console.error).not.toHaveBeenCalled();
      expect(result).toStrictEqual({ severity: "error", summary: "Error", detail: "Test error toast", life: 3000 });
    });
  });

  describe("warn", () => {
    const testError = new Error("Test error message");
    beforeEach(() => {
      jest.clearAllMocks();
      console.warn = jest.fn();
    });

    it("creates a log in the console and returns a toast message", () => {
      const result = LoggerService.warn("Test warn toast", testError);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(testError);
      expect(result).toStrictEqual({ severity: "warn", summary: "Warning", detail: "Test warn toast", life: 3000 });
    });

    it("creates a log in the console no return toast message", () => {
      const result = LoggerService.warn(undefined, testError);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(testError);
      expect(result).toBeUndefined();
    });

    it("returns a toast message, no console", () => {
      const result = LoggerService.warn("Test warn toast");
      expect(console.warn).not.toHaveBeenCalled();
      expect(result).toStrictEqual({ severity: "warn", summary: "Warning", detail: "Test warn toast", life: 3000 });
    });
  });

  describe("info", () => {
    const testError = new Error("Test error message");
    beforeEach(() => {
      jest.clearAllMocks();
      console.info = jest.fn();
    });

    it("creates an info in the console and returns a toast message", () => {
      const result = LoggerService.info("Test info toast", testError);
      expect(console.info).toHaveBeenCalledTimes(1);
      expect(console.info).toHaveBeenCalledWith(testError);
      expect(result).toStrictEqual({ severity: "info", summary: "Info", detail: "Test info toast", life: 3000 });
    });

    it("creates an info in the console no return toast message", () => {
      const result = LoggerService.info(undefined, testError);
      expect(console.info).toHaveBeenCalledTimes(1);
      expect(console.info).toHaveBeenCalledWith(testError);
      expect(result).toBeUndefined();
    });

    it("returns a toast message, no console", () => {
      const result = LoggerService.info("Test info toast");
      expect(console.info).not.toHaveBeenCalled();
      expect(result).toStrictEqual({ severity: "info", summary: "Info", detail: "Test info toast", life: 3000 });
    });
  });

  describe("success", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      console.log = jest.fn();
    });

    it("creates a log in the console and returns a toast message", () => {
      const result = LoggerService.success("Test success toast", "Test success log");
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith("Test success log");
      expect(result).toStrictEqual({ severity: "success", summary: "Success", detail: "Test success toast", life: 3000 });
    });

    it("creates a log in the console no return toast message", () => {
      const result = LoggerService.success(undefined, "Test success log");
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith("Test success log");
      expect(result).toBeUndefined();
    });

    it("returns a toast message, no console", () => {
      const result = LoggerService.success("Test success toast");
      expect(console.log).not.toHaveBeenCalled();
      expect(result).toStrictEqual({ severity: "success", summary: "Success", detail: "Test success toast", life: 3000 });
    });
  });

  describe("debug", () => {
    it("creates a debug to console", () => {
      console.debug = jest.fn();
      LoggerService.debug("Test debug log");
      expect(console.debug).toHaveBeenCalledTimes(1);
      expect(console.debug).toHaveBeenCalledWith("Test debug log");
    });
  });

  describe("trace", () => {
    it("creates a trace to console", () => {
      console.trace = jest.fn();
      LoggerService.trace("Test trace log");
      expect(console.trace).toHaveBeenCalledTimes(1);
      expect(console.trace).toHaveBeenCalledWith("Test trace log");
    });
  });
});
