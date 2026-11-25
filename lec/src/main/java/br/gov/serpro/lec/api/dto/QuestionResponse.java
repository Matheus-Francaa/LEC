package br.gov.serpro.lec.api.dto;

import java.util.List;

public record QuestionResponse(
        String id,
        String secao,
        String codigo,
        String enunciado,
        String tipoResposta,
        boolean obrigatoria,
        List<String> opcoes) {}
