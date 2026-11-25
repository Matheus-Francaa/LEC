package br.gov.serpro.lec.api.dto;

import br.gov.serpro.lec.domain.model.StatusLec;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record LecResponse(
        UUID id,
        String nomeSolucao,
        String especialistaResponsavel,
        StatusLec status,
        int versao,
        Instant criadoEm,
        Instant atualizadoEm,
        ClassificationRequest classification,
        Map<String, AnswerResponse> respostas,
        List<CommentResponse> comentarios,
        RulesResultResponse resultadoRules,
        String parecerDevolucao,
        String planoExecucao) {}
