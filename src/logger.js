// SILENCED LOGGER: All logs are disabled to prevent host stream-merging issues.
// On some Windows systems, stderr is merged into stdout, which breaks the MCP protocol.

const logger = {
  info: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {},
};

export default logger;
