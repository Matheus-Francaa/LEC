package br.gov.serpro.lec.domain.service;

import br.gov.serpro.lec.domain.model.Lec;
import br.gov.serpro.lec.domain.model.Question;
import br.gov.serpro.lec.domain.model.StatusLec;
import br.gov.serpro.lec.repository.ClassificationGroupRepository;
import br.gov.serpro.lec.repository.LecRepository;
import br.gov.serpro.lec.repository.QuestionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LecServiceTest {

    @Mock
    private LecRepository lecRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private ClassificationGroupRepository groupRepository;

    @InjectMocks
    private LecService lecService;

    @Test
    void refusesToSubmitUntilAllRequiredAnswersArePresent() {
        UUID id = UUID.randomUUID();
        Lec lec = new Lec();
        lec.setNomeSolucao("Portal");
        lec.setGrupoClassificacao("Transacional");
        lec.setTipoSolucao("Web");
        lec.setStatus(StatusLec.RASCUNHO);
        Question requiredQuestion = mock(Question.class);
        when(requiredQuestion.getId()).thenReturn("esc_1");
        when(requiredQuestion.isObrigatoria()).thenReturn(true);
        when(lecRepository.findById(id)).thenReturn(Optional.of(lec));
        when(questionRepository.findAll()).thenReturn(List.of(requiredQuestion));

        LecValidationException exception = assertThrows(
                LecValidationException.class, () -> lecService.submit(id));

        assertEquals("Responda esta pergunta.", exception.getErrors().get("respostas.esc_1"));
        verify(lecRepository, never()).save(any());
    }
}
