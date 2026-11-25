package br.gov.serpro.lec.api.dto;

import java.util.List;

public record RulesResultResponse(
        int pontuacaoPertinencia,
        boolean indicadorRAT,
        boolean indicadorRIPD,
        boolean indicadorAIA,
        boolean indicadorGRSI,
        List<String> detalhes) {}
