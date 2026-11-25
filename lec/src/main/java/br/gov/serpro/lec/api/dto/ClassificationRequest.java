package br.gov.serpro.lec.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public record ClassificationRequest(
        @JsonAlias("classificacao") String grupo,
        String tipo,
        String subtipo) {}
