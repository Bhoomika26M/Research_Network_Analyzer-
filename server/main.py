from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import models
from database import engine
import routes

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SciCollab API")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception handler for Pydantic validation errors (optional, but good for consistent format)
from fastapi.exceptions import RequestValidationError
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"message": "Validation error: " + str(exc.errors())}
    )

# consistent JSON errors for HTTP exceptions are handled by default as {"detail": {"message": ...}} but let's override to just {"message": ...} if the detail is a dict with message
from fastapi import HTTPException
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    if isinstance(exc.detail, dict) and "message" in exc.detail:
        return JSONResponse(status_code=exc.status_code, content={"message": exc.detail["message"]})
    return JSONResponse(status_code=exc.status_code, content={"message": str(exc.detail)})

app.include_router(routes.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
