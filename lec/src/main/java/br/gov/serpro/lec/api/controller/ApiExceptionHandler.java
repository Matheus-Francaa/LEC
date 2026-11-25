package br.gov.serpro.lec.api.controller;

import br.gov.serpro.lec.api.dto.ApiErrorResponse;
import br.gov.serpro.lec.domain.service.LecValidationException;
import br.gov.serpro.lec.domain.service.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> validation(
            MethodArgumentNotValidException exception, HttpServletRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error ->
                errors.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return response(HttpStatus.BAD_REQUEST, "Revise os campos destacados.", errors, request);
    }

    @ExceptionHandler(LecValidationException.class)
    public ResponseEntity<ApiErrorResponse> lecValidation(
            LecValidationException exception, HttpServletRequest request) {
        return response(HttpStatus.BAD_REQUEST, exception.getMessage(), exception.getErrors(), request);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> notFound(
            ResourceNotFoundException exception, HttpServletRequest request) {
        return response(HttpStatus.NOT_FOUND, exception.getMessage(), Map.of(), request);
    }

    @ExceptionHandler({IllegalStateException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiErrorResponse> conflictOrInvalidParameter(
            Exception exception, HttpServletRequest request) {
        HttpStatus status = exception instanceof MethodArgumentTypeMismatchException
                ? HttpStatus.BAD_REQUEST : HttpStatus.CONFLICT;
        return response(status, exception.getMessage(), Map.of(), request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> invalidBody(
            HttpMessageNotReadableException exception, HttpServletRequest request) {
        return response(HttpStatus.BAD_REQUEST, "O corpo da requisição está inválido.", Map.of(), request);
    }

    private ResponseEntity<ApiErrorResponse> response(
            HttpStatus status, String message, Map<String, String> errors, HttpServletRequest request) {
        ApiErrorResponse body = new ApiErrorResponse(
                Instant.now(), status.value(), status.getReasonPhrase(), message, errors, request.getRequestURI());
        return ResponseEntity.status(status).body(body);
    }
}
