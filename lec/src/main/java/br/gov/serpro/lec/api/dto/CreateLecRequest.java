package br.gov.serpro.lec.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateLecRequest(
        @NotBlank(message = "Informe o nome da solução.")
        @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres.")
        String nomeSolucao,
        @Size(max = 150, message = "O nome do especialista deve ter no máximo 150 caracteres.")
        String especialistaResponsavel) {}
