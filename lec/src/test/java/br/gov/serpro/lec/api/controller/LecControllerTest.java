package br.gov.serpro.lec.api.controller;

import br.gov.serpro.lec.api.dto.*;
import br.gov.serpro.lec.domain.model.StatusLec;
import br.gov.serpro.lec.domain.service.LecService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LecController.class)
@Import(ApiExceptionHandler.class)
class LecControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private LecService lecService;

    @Test
    void createsLecAndReturnsCreatedResponse() throws Exception {
        UUID id = UUID.randomUUID();
        Instant now = Instant.now();
        when(lecService.create(any())).thenReturn(new LecResponse(
                id, "Portal", null, StatusLec.RASCUNHO, 1, now, now,
                new ClassificationRequest(null, null, null), Map.of(), List.of(),
                new RulesResultResponse(20, false, false, false, false, List.of()),
                null, null));

        mockMvc.perform(post("/v1/lecs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nomeSolucao":"Portal","especialistaResponsavel":""}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.nomeSolucao").value("Portal"))
                .andExpect(jsonPath("$.status").value("RASCUNHO"));
    }

    @Test
    void returnsFieldErrorsForInvalidCreateRequest() throws Exception {
        mockMvc.perform(post("/v1/lecs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nomeSolucao":" "}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Revise os campos destacados."))
                .andExpect(jsonPath("$.validationErrors.nomeSolucao").exists());
        verifyNoInteractions(lecService);
    }
}
