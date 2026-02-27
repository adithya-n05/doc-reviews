export type LogLevel = "info" | "warn" | "error";

export type LogContext = Record<string, unknown>;

export type LogEntry = {
  level: LogLevel;
  message: string;
  context: LogContext;
  timestamp: string;
};

export function createLogEntry(
  level: LogLevel,
  message: string,
  context: LogContext = {},
): LogEntry {
  return {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  };
}

function write(entry: LogEntry): void {
  const serialized = JSON.stringify(entry);
  if (entry.level === "info") {
    console.info(serialized);
    return;
  }
  if (entry.level === "warn") {
    console.warn(serialized);
    return;
  }
  console.error(serialized);
}

export function logInfo(message: string, context: LogContext = {}): void {
  write(createLogEntry("info", message, context));
}

export function logWarn(message: string, context: LogContext = {}): void {
  write(createLogEntry("warn", message, context));
}

export function logError(message: string, context: LogContext = {}): void {
  write(createLogEntry("error", message, context));
}
