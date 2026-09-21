import { ZodError } from 'zod';

export function errorHandler(
  error,
  req,
  res,
  _next
) {
  if (
    error instanceof
    ZodError
  ) {
    return res
      .status(422)
      .json({
        message:
          'Validation failed',

        issues:
          error.issues,
      });
  }

  if (
    error.code ===
    11000
  ) {
    return res
      .status(409)
      .json({
        message:
          'A record with this unique value already exists',

        details:
          error.keyValue,
      });
  }

  if (
    error.name ===
    'ValidationError'
  ) {
    return res
      .status(422)
      .json({
        message:
          'Validation failed',

        details:
          Object.fromEntries(
            Object.entries(
              error.errors ||
                {}
            ).map(
              (
                [
                  field,
                  issue,
                ]
              ) => [
                field,
                issue.message,
              ]
            )
          ),
      });
  }

  if (
    error.name ===
    'CastError'
  ) {
    return res
      .status(400)
      .json({
        message:
          `Invalid ${error.path || 'identifier'}`,

        details:
          error.value,
      });
  }

  const statusCode =
    error.statusCode ||
    500;

  /*
   * Log unexpected backend failures in the
   * server terminal without exposing sensitive
   * stack traces to the browser.
   */
  if (
    statusCode >=
    500
  ) {
    console.error(
      '\n===== UNHANDLED API ERROR ====='
    );

    console.error(
      'Method:',
      req.method
    );

    console.error(
      'URL:',
      req.originalUrl
    );

    console.error(
      'Message:',
      error.message
    );

    console.error(
      'Name:',
      error.name
    );

    console.error(
      'Stack:',
      error.stack
    );

    console.error(
      '===============================\n'
    );
  }

  const message =
    statusCode ===
    500
      ? 'Internal server error'
      : error.message;

  return res
    .status(
      statusCode
    )
    .json({
      message,

      details:
        error.details,
    });
}