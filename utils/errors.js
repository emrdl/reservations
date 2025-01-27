class ValidationError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = 'ValidationError';
        this.details = details;
    }
}

class AuthenticationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

class AuthorizationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthorizationError';
    }
}

class ResourceNotFoundError extends Error {
    constructor(resource, id) {
        super(`${resource} bulunamadı (ID: ${id})`);
        this.name = 'ResourceNotFoundError';
        this.resource = resource;
        this.resourceId = id;
    }
}

class BusinessLogicError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'BusinessLogicError';
        this.code = code;
    }
}

class DatabaseError extends Error {
    constructor(message, query) {
        super(message);
        this.name = 'DatabaseError';
        this.query = query;
    }
}

class ExternalServiceError extends Error {
    constructor(service, message) {
        super(`${service} servisi hatası: ${message}`);
        this.name = 'ExternalServiceError';
        this.service = service;
    }
}

class RateLimitError extends Error {
    constructor(retryAfter) {
        super('Rate limit aşıldı');
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}

module.exports = {
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    ResourceNotFoundError,
    BusinessLogicError,
    DatabaseError,
    ExternalServiceError,
    RateLimitError
}; 