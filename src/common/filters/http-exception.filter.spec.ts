import { AllExceptionsFilter } from './http-exception.filter';
import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  // Suppress logger output saat testing
  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  type MockResponse = {
    status: jest.Mock<any, any>;
    json: jest.Mock<any, any>;
  };

  type MockRequest = {
    method: string;
    url: string;
  };

  let mockResponse: MockResponse;
  let mockRequest: MockRequest;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      method: 'GET',
      url: '/api/students',
    };

    const mockHttpArgumentsHost = {
      getResponse: jest.fn().mockReturnValue(mockResponse),
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getNext: jest.fn(),
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue(mockHttpArgumentsHost),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      getType: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException and return correct status code', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        path: mockRequest.url,
      }),
    );
  });

  it('should handle unknown exception with 500 status code', () => {
    const exception = new Error('Unexpected error');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        path: mockRequest.url,
      }),
    );
  });

  it('should include timestamp in response', () => {
    const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: expect.any(String) as unknown as string,
      }),
    );
  });
});
