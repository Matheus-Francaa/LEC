package br.gov.serpro.lec.domain.service;

import br.gov.serpro.lec.api.dto.*;
import br.gov.serpro.lec.domain.model.*;
import br.gov.serpro.lec.repository.ClassificationGroupRepository;
import br.gov.serpro.lec.repository.LecRepository;
import br.gov.serpro.lec.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class LecService {
    private final LecRepository lecRepository;
    private final QuestionRepository questionRepository;
    private final ClassificationGroupRepository groupRepository;

    public LecService(
            LecRepository lecRepository,
            QuestionRepository questionRepository,
            ClassificationGroupRepository groupRepository) {
        this.lecRepository = lecRepository;
        this.questionRepository = questionRepository;
        this.groupRepository = groupRepository;
    }

    @Transactional
    public LecResponse create(CreateLecRequest request) {
        Lec lec = new Lec();
        lec.setNomeSolucao(request.nomeSolucao().trim());
        lec.setEspecialistaResponsavel(normalize(request.especialistaResponsavel()));
        return toResponse(lecRepository.save(lec));
    }

    @Transactional(readOnly = true)
    public List<LecResponse> findAll(StatusLec status) {
        List<Lec> lecs = status == null
                ? lecRepository.findAllByOrderByAtualizadoEmDesc()
                : lecRepository.findByStatusOrderByAtualizadoEmDesc(status);
        return lecs.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public LecResponse findById(UUID id) {
        return toResponse(requireLec(id));
    }

    @Transactional
    public LecResponse update(UUID id, LecRequest request) {
        Lec lec = requireLec(id);
        lec.setNomeSolucao(request.nomeSolucao().trim());
        lec.setEspecialistaResponsavel(normalize(request.especialistaResponsavel()));

        ClassificationRequest classification = request.classification();
        if (classification != null) {
            String group = normalize(classification.grupo());
            if (group != null && !groupRepository.existsById(group)) {
                throw new LecValidationException("Revise os campos destacados.",
                        Map.of("classification.grupo", "Selecione um grupo válido."));
            }
            lec.setGrupoClassificacao(group);
            lec.setTipoSolucao(normalize(classification.tipo()));
            lec.setSubtipoSolucao(normalize(classification.subtipo()));
        }

        Map<String, String> answers = request.respostas();
        if (answers != null) {
            Map<String, LecAnswer> current = lec.getRespostas().stream()
                    .collect(Collectors.toMap(LecAnswer::getQuestionId, Function.identity()));
            for (Map.Entry<String, String> entry : answers.entrySet()) {
                Question question = questionRepository.findById(entry.getKey()).orElse(null);
                if (question == null) {
                    throw new LecValidationException("A pergunta informada não existe.",
                            Map.of("respostas." + entry.getKey(), "Pergunta desconhecida."));
                }
                String value = normalize(entry.getValue());
                if (value != null && "OPCOES".equals(question.getTipoResposta())
                        && !question.getOpcoes().contains(value)) {
                    throw new LecValidationException("Revise os campos destacados.",
                            Map.of("respostas." + entry.getKey(), "Selecione uma opção válida."));
                }
                int maxLength = "etica_2".equals(question.getId()) ? 4000 : 10000;
                if (value != null && value.length() > maxLength) {
                    throw new LecValidationException("Revise os campos destacados.",
                            Map.of("respostas." + entry.getKey(),
                                    "A resposta deve ter no máximo " + maxLength + " caracteres."));
                }
                LecAnswer answer = current.get(entry.getKey());
                if (value == null) {
                    if (answer != null) {
                        lec.getRespostas().remove(answer);
                    }
                } else if (answer == null) {
                    lec.getRespostas().add(new LecAnswer(lec, entry.getKey(), value));
                } else {
                    answer.setValue(value);
                }
            }
        }
        return toResponse(lecRepository.save(lec));
    }

    @Transactional
    public void updateClassification(UUID id, ClassificationRequest classification) {
        if (classification == null) {
            throw new LecValidationException("O corpo da requisição está inválido.",
                    Map.of("classification", "Informe a classificação."));
        }
        Lec lec = requireLec(id);
        lec.setGrupoClassificacao(normalize(classification.grupo()));
        if (classification.tipo() != null) {
            lec.setTipoSolucao(normalize(classification.tipo()));
        }
        if (classification.subtipo() != null) {
            lec.setSubtipoSolucao(normalize(classification.subtipo()));
        }
        lecRepository.save(lec);
    }

    @Transactional
    public LecResponse submit(UUID id) {
        Lec lec = requireLec(id);
        Map<String, String> answers = answerValues(lec);
        Map<String, String> errors = new LinkedHashMap<>();
        if (normalize(lec.getGrupoClassificacao()) == null) {
            errors.put("classification.grupo", "Selecione o grupo da solução.");
        }
        if (normalize(lec.getTipoSolucao()) == null) {
            errors.put("classification.tipo", "Informe o tipo de solução.");
        }
        questionRepository.findAll().stream()
                .filter(Question::isObrigatoria)
                .filter(question -> normalize(answers.get(question.getId())) == null)
                .forEach(question -> errors.put("respostas." + question.getId(), "Responda esta pergunta."));
        if (!errors.isEmpty()) {
            throw new LecValidationException("Preencha os campos obrigatórios antes de enviar.", errors);
        }
        if (lec.getStatus() != StatusLec.RASCUNHO && lec.getStatus() != StatusLec.DEVOLVIDO) {
            throw new IllegalStateException("Somente rascunhos ou LECs devolvidos podem ser enviados.");
        }
        lec.setStatus(StatusLec.EM_REVISAO);
        lec.setParecerDevolucao(null);
        return toResponse(lecRepository.save(lec));
    }

    @Transactional
    public LecResponse returnForChanges(UUID id, WorkflowDecisionRequest request) {
        Lec lec = requireReviewable(id);
        lec.setStatus(StatusLec.DEVOLVIDO);
        lec.setParecerDevolucao(request.texto().trim());
        return toResponse(lecRepository.save(lec));
    }

    @Transactional
    public LecResponse approve(UUID id, WorkflowDecisionRequest request) {
        Lec lec = requireReviewable(id);
        lec.setStatus(StatusLec.APROVADO);
        lec.setPlanoExecucao(request.texto().trim());
        return toResponse(lecRepository.save(lec));
    }

    @Transactional
    public CommentResponse addComment(UUID id, CommentRequest request) {
        Lec lec = requireLec(id);
        if (!questionRepository.existsById(request.perguntaId())) {
            throw new LecValidationException("Revise os campos destacados.",
                    Map.of("perguntaId", "Pergunta desconhecida."));
        }
        LecComment comment = new LecComment(lec, request.perguntaId(), request.texto().trim());
        lec.getComentarios().add(comment);
        lecRepository.save(lec);
        return toCommentResponse(comment);
    }

    @Transactional
    public void deleteComment(UUID id, UUID commentId) {
        Lec lec = requireLec(id);
        LecComment comment = lec.getComentarios().stream()
                .filter(item -> item.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Comentário"));
        lec.getComentarios().remove(comment);
        lecRepository.save(lec);
    }

    @Transactional
    public void delete(UUID id) {
        Lec lec = requireLec(id);
        lecRepository.delete(lec);
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> questions() {
        return questionRepository.findAllByOrderBySecaoAscCodigoAsc().stream()
                .map(question -> new QuestionResponse(
                        question.getId(), question.getSecao(), question.getCodigo(),
                        question.getEnunciado(), question.getTipoResposta(),
                        question.isObrigatoria(), question.getOpcoes()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> classificationGroups() {
        return groupRepository.findAllByOrderByOrdemAsc().stream()
                .map(ClassificationGroup::getNome)
                .toList();
    }

    private Lec requireLec(UUID id) {
        return lecRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LEC"));
    }

    private Lec requireReviewable(UUID id) {
        Lec lec = requireLec(id);
        if (lec.getStatus() != StatusLec.EM_REVISAO) {
            throw new IllegalStateException("A decisão só pode ser registrada em um LEC em revisão.");
        }
        return lec;
    }

    private LecResponse toResponse(Lec lec) {
        Map<String, String> values = answerValues(lec);
        Map<String, AnswerResponse> answers = lec.getRespostas().stream()
                .collect(Collectors.toMap(
                        LecAnswer::getQuestionId,
                        answer -> new AnswerResponse(
                                answer.getQuestionId(), answer.getValue(), "USUARIO", answer.getUpdatedAt()),
                        (first, second) -> second,
                        LinkedHashMap::new));
        List<CommentResponse> comments = lec.getComentarios().stream()
                .map(this::toCommentResponse)
                .toList();
        ClassificationRequest classification = new ClassificationRequest(
                lec.getGrupoClassificacao(), lec.getTipoSolucao(), lec.getSubtipoSolucao());
        return new LecResponse(
                lec.getIdLec(), lec.getNomeSolucao(), lec.getEspecialistaResponsavel(),
                lec.getStatus(), lec.getVersao() == null ? 1 : lec.getVersao(),
                lec.getCriadoEm(), lec.getAtualizadoEm(), classification, answers,
                comments, calculateRules(lec, values),
                lec.getParecerDevolucao(), lec.getPlanoExecucao());
    }

    private CommentResponse toCommentResponse(LecComment comment) {
        return new CommentResponse(
                comment.getId(), comment.getQuestionId(), comment.getTexto(),
                comment.isResolvido(), comment.getCriadoEm());
    }

    private Map<String, String> answerValues(Lec lec) {
        return lec.getRespostas().stream().collect(Collectors.toMap(
                LecAnswer::getQuestionId, LecAnswer::getValue, (first, second) -> second));
    }

    private RulesResultResponse calculateRules(Lec lec, Map<String, String> answers) {
        int score = 20;
        boolean rat = "Sim".equals(answers.get("ctx_1"));
        boolean ripd = "Sim".equals(answers.get("ctx_2"));
        boolean ia = "Inteligência Artificial".equals(lec.getGrupoClassificacao());
        boolean grsi = ia || ripd;
        for (String value : answers.values()) {
            if ("Sim".equals(value)) {
                score += 15;
            }
        }
        if (ia) {
            score += 25;
        }
        score = Math.min(score, 100);
        List<String> details = new ArrayList<>();
        details.add("Pontuação de Pertinência calculada: " + score);
        details.add(rat ? "RAT ativado por tratamento de dados pessoais." : "RAT não requerido.");
        details.add(ripd ? "RIPD obrigatório por envolver grupos vulneráveis." : "RIPD não requerido.");
        details.add(ia ? "AIA ativado por classificação de Inteligência Artificial." : "AIA não requerido.");
        details.add(grsi ? "GRSI ativado." : "GRSI não requerido.");
        return new RulesResultResponse(score, rat, ripd, ia, grsi, details);
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
