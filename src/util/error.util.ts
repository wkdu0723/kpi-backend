function logError(error: unknown) {
  const { name, message, stack } = error as Error & { stack?: string };
  const errorOriginLog =
    stack?.split("\n").slice(1, 4).join("\n") ?? "invokeOrigin not found";

  const errorMsgFormat = (errType: string, message: string) =>
    `ERROR_TYPE: ${errType}\nERROR_ORIGIN: ${errorOriginLog}\nERROR_MESSAGE: ${message}`;

  console.error(errorMsgFormat(name, message));
}

export { logError };
