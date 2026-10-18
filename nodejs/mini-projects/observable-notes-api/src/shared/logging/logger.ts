type LogFields = Record<string, unknown>;

export const logger = {
  info(message: string, fields: LogFields = {}): void {
    console.info(message, fields);
  },
  warn(message: string, fields: LogFields = {}): void {
    console.warn(message, fields);
  },
  error(message: string, fields: LogFields = {}): void {
    console.error(message, fields);
  }
};
