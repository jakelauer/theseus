# Theseus Logger Usage Guide

The Theseus logging utility, part of Theseus, offers a flexible and convenient way to implement logging in
your JavaScript applications. It leverages popular tools and best practices to ensure that logging is both
informative and manageable. This guide focuses on the `get-theseus-logger.ts` utility, which is central to
acquiring and using the logger.

### Importing the Logger

To get started with the Theseus logger, import the `getTheseusLogger` function from the
`get-theseus-logger.ts` file:

```typescript
import { getTheseusLogger } from "theseus-js";
```

### Basic Usage

The `getTheseusLogger` function allows you to create or retrieve a logger instance. Here's a simple example of
how to use it:

```typescript
const logger = getTheseusLogger("myLogger");

logger.info("This is an informational message");
logger.warn("This is a warning message");
logger.error("This is an error message");
```

In the above example, `myLogger` is a named logger instance. You can create multiple loggers with different
names to represent different parts of your application or different kinds of logs.

## Configuration

The Theseus logger's behavior can be customized through the `setTheseusLogLevel` function and by providing
options to `winston-config-builder.ts` for detailed configuration.

### Setting Log Level

You can control the log level globally using the `setTheseusLogLevel` function. This determines the minimum
level of messages that will be logged.

```typescript
import { setTheseusLogLevel } from "path/to/src/lib/Shared/Log/set-theseus-log-level";

setTheseusLogLevel("debug"); // Valid levels: error, warn, major, info, verbose, debug, silly
```
