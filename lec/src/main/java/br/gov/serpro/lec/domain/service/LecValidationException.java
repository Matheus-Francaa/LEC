package br.gov.serpro.lec.domain.service;

import java.util.Map;

public class LecValidationException extends RuntimeException {
    private final Map<String, String> errors;

    public LecValidationException(String message, Map<String, String> errors) {
        super(message);
        this.errors = Map.copyOf(errors);
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}
