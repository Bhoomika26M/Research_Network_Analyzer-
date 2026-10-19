"""Consistent error responses: every error is ``{"error": {"code", "message", "status_code"}}``."""

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


def error_body(status_code: int, code: str, message: str) -> dict:
    return {"error": {"code": code, "message": message, "status_code": status_code}}


class ApiException(HTTPException):
    """HTTP error with a machine-readable ``code``, handled by register_error_handlers."""

    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(status_code=status_code, detail={"code": code, "message": message})


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        detail = exc.detail
        if isinstance(detail, dict) and "message" in detail:
            code = str(detail.get("code", "error"))
            message = str(detail["message"])
        else:
            code, message = "error", str(detail)
        return JSONResponse(
            status_code=exc.status_code,
            content=error_body(exc.status_code, code, message),
            headers=exc.headers,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        messages = "; ".join(
            ".".join(str(part) for part in error["loc"]) + ": " + error["msg"]
            for error in exc.errors()
        )
        return JSONResponse(
            status_code=422,
            content=error_body(422, "validation_error", messages),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content=error_body(500, "internal_error", "Internal server error"),
        )
