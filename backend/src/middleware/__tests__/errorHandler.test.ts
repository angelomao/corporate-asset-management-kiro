import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../errorHandler';
import { ZodError } from 'zod';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock Express objects
const mockRequest = (): Partial<Request> => ({});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

// Mock console.error to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Error Handler Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('should handle ZodError with validation details', () => {
    const zodError = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['name'],
        message: 'Expected string, received number'
      },
      {
        code: 'too_small',
        minimum: 8,
        type: 'string',
        inclusive: true,
        path: ['password'],
        message: 'String must contain at least 8 character(s)'
      }
    ]);

    const req = mockRequest() as Request;
    const res = mockResponse() as Response;

    errorHandler(zodError, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Validation failed',
      details: [
        'name: Expected string, received number',
        'password: String must contain at least 8 character(s)'
      ]
    });
    expect(console.error).toHaveBeenCalledWith('Validation error:', zodError.errors);
  });

  it('should handle generic Error with message', () => {
    const error = new Error('Something went wrong');

    const req = mockRequest() as Request;
    const res = mockResponse() as Response;

    errorHandler(error, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Something went wrong'
    });
    expect(console.error).toHaveBeenCalledWith('Error:', error);
  });

  it('should handle unknown error types', () => {
    const error = 'String error' as any;

    const req = mockRequest() as Request;
    const res = mockResponse() as Response;

    errorHandler(error, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal server error'
    });
    expect(console.error).toHaveBeenCalledWith('Unknown error:', error);
  });

  it('should handle Error without message', () => {
    const error = new Error();

    const req = mockRequest() as Request;
    const res = mockResponse() as Response;

    errorHandler(error, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal server error'
    });
    expect(console.error).toHaveBeenCalledWith('Error:', error);
  });

  it('should handle null/undefined errors', () => {
    const req = mockRequest() as Request;
    const res = mockResponse() as Response;

    errorHandler(null as any, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal server error'
    });
    expect(console.error).toHaveBeenCalledWith('Unknown error:', null);
  });
});