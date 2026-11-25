package br.gov.serpro.lec.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequest(
        @NotBlank(message = "Selecione uma pergunta para o comentário.")
        String perguntaId,
        @NotBlank(message = "Escreva o comentário.")
        @Size(max = 4000, message = "O comentário deve ter no máximo 4000 caracteres.")
        String texto) {}
