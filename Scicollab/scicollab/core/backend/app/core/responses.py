# core/backend/app/core/responses.py

def create_success_response(data=None, message=""):
    return {
        "success": True,
        "data": data,
        "message": message,
    }

def create_error_response(message="", data=None):
    return {
        "success": False,
        "data": data,
        "message": message,
    }
