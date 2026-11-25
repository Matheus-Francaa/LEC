package br.gov.serpro.lec.api.dto;

import java.time.Instant;

public record AnswerResponse(String perguntaId, String valor, String origem, Instant atualizadoEm) {}
