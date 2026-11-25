package br.gov.serpro.lec.domain.service;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource) {
        super(resource + " não encontrado.");
    }
}
