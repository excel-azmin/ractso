"""Custom exceptions"""
from fastapi import HTTPException, status


class ModelNotLoadedError(HTTPException):
    """Raised when model is not loaded"""
    
    def __init__(self, detail: str = "Model not loaded. Please train the model first."):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail
        )


class TrainingError(HTTPException):
    """Raised when training fails"""
    
    def __init__(self, detail: str = "Training failed"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail
        )


class DatabaseError(HTTPException):
    """Raised when database operation fails"""
    
    def __init__(self, detail: str = "Database operation failed"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail
        )

