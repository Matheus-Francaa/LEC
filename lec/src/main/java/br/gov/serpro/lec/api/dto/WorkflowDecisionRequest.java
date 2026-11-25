package br.gov.serpro.lec.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WorkflowDecisionRequest(
        @NotBlank(message = "Este campo é obrigatório.")
        @Size(max = 4000, message = "O texto deve ter no máximo 4000 caracteres.")
        String texto) {}
