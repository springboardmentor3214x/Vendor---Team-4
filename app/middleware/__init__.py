"""
Custom middleware for the application.

Includes request logging middleware that logs method, path,
status code, and response time for every request.
"""

import logging
import time

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

logger = logging.getLogger("vrip.middleware")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that logs details about each incoming HTTP request.

    Logs:
        - HTTP method
        - Request path
        - Response status code
        - Processing time in milliseconds
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        start_time = time.time()

        response = await call_next(request)

        process_time_ms = (time.time() - start_time) * 1000

        logger.info(
            "%s %s -> %d (%.2fms)",
            request.method,
            request.url.path,
            response.status_code,
            process_time_ms,
        )

        # Add processing time header
        response.headers["X-Process-Time-Ms"] = f"{process_time_ms:.2f}"

        return response
