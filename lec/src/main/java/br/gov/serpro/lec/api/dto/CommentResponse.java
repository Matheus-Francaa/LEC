package br.gov.serpro.lec.api.dto;

import java.time.Instant;
import java.util.UUID;

public record CommentResponse(
        UUID id,
        String perguntaId,
        String texto,
        boolean resolvido,
        Instant criadoEm) {}
