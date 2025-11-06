# Project Structure

This document explains the production-ready folder structure of the recommendation API.

## Directory Structure

```
recommendation/
├── app/                          # Main application package
│   ├── __init__.py              # Package initialization
│   ├── main.py                  # FastAPI application entry point
│   ├── config.py                # Configuration management (Pydantic Settings)
│   ├── database.py              # Async PostgreSQL connection pool
│   │
│   ├── models/                  # ML Models
│   │   ├── __init__.py
│   │   └── recommendation_model.py  # TensorFlow Recommenders model
│   │
│   ├── services/                # Business Logic Layer
│   │   ├── __init__.py
│   │   ├── trainer.py          # Model training service
│   │   └── recommendation_service.py  # Recommendation generation service
│   │
│   ├── api/                     # API Layer
│   │   ├── __init__.py
│   │   ├── dependencies.py     # Dependency injection
│   │   └── v1/                  # API version 1
│   │       ├── __init__.py
│   │       ├── routes.py        # Route handlers
│   │       └── schemas.py       # Pydantic request/response schemas
│   │
│   └── utils/                   # Utility Functions
│       ├── __init__.py
│       └── exceptions.py       # Custom exceptions
│
├── models/                      # Saved model files (gitignored)
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── run.sh                       # Run script
├── README.md                    # Main documentation
├── QUICKSTART.md               # Quick start guide
└── STRUCTURE.md                # This file
```

## Component Descriptions

### `app/main.py`

- FastAPI application initialization
- Lifespan events (startup/shutdown)
- Middleware configuration (CORS)
- Router inclusion

### `app/config.py`

- Centralized configuration using Pydantic Settings
- Environment variable management
- Type-safe configuration

### `app/database.py`

- Async PostgreSQL connection pool using `asyncpg`
- Connection management with context managers
- Query execution methods

### `app/models/recommendation_model.py`

- TensorFlow Recommenders model definition
- Model loading utility
- Embedding architecture

### `app/services/trainer.py`

- Model training logic
- Data loading from database
- TensorFlow dataset preparation
- Model saving

### `app/services/recommendation_service.py`

- Recommendation generation logic
- Model loading and management
- Database queries for post details
- Popular posts fallback

### `app/api/v1/routes.py`

- FastAPI route handlers
- Request/response handling
- Error handling
- Dependency injection

### `app/api/v1/schemas.py`

- Pydantic models for request validation
- Pydantic models for response serialization
- Type-safe API contracts

### `app/api/dependencies.py`

- FastAPI dependency injection
- Service instantiation

### `app/utils/exceptions.py`

- Custom HTTP exceptions
- Standardized error responses

## Design Principles

### 1. Separation of Concerns

- **Models**: ML model definitions
- **Services**: Business logic
- **API**: Request/response handling
- **Utils**: Shared utilities

### 2. Dependency Injection

- FastAPI's dependency system
- Clean service separation
- Easy testing and mocking

### 3. Async/Await

- Non-blocking I/O operations
- Database connection pooling
- Improved concurrency

### 4. Type Safety

- Pydantic schemas for validation
- Type hints throughout
- IDE autocomplete support

### 5. Error Handling

- Custom exceptions
- Proper HTTP status codes
- Detailed error messages

## Benefits of This Structure

1. **Scalability**: Easy to add new features and endpoints
2. **Maintainability**: Clear separation of concerns
3. **Testability**: Services can be easily mocked
4. **Type Safety**: Catch errors at development time
5. **Documentation**: Auto-generated API docs from schemas
6. **Production Ready**: Proper error handling and logging

## Adding New Features

### Adding a New Endpoint

1. Add schema to `app/api/v1/schemas.py`
2. Add route handler to `app/api/v1/routes.py`
3. Add business logic to `app/services/` if needed

### Adding a New Service

1. Create file in `app/services/`
2. Add dependency in `app/api/dependencies.py`
3. Use in route handlers via dependency injection

### Adding a New Model

1. Create file in `app/models/`
2. Import and use in services

## Testing

With this structure, you can easily:

- Mock services in tests
- Test business logic independently
- Test API endpoints with FastAPI test client
- Integration test database operations

## Deployment

The structure supports:

- Docker containerization
- Process managers (systemd, supervisor)
- Load balancers with multiple workers
- Environment-based configuration
