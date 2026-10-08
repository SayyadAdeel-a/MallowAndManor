import mongoose from 'mongoose';

// Central error handler. Logs the real error server-side and returns a generic
// message so Mongoose internals (collection names, index definitions, field
// values) don't leak to the client.
export const errorHandler = (err, req, res, _next) => {
  console.error(`[${req.method} ${req.originalUrl}]`, err.stack || err);

  // Headers already flushed — the response is committed, so there is nothing
  // safe to send. Trying anyway throws ERR_HTTP_HEADERS_SENT and can take down
  // the request handler.
  if (res.headersSent) return;

  if (err instanceof mongoose.Error.ValidationError || err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: 'Invalid request data' });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON body' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large' });
  }

  return res.status(err.status || 500).json({ error: 'Internal server error' });
};
