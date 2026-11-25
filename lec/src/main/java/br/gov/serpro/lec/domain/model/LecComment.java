package br.gov.serpro.lec.domain.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "lec_comment")
public class LecComment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lec_id", nullable = false)
    private Lec lec;

    @Column(name = "question_id", nullable = false, length = 40)
    private String questionId;

    @Column(nullable = false, columnDefinition = "text")
    private String texto;

    @Column(nullable = false)
    private boolean resolvido;

    @Column(name = "created_at", nullable = false)
    private Instant criadoEm;

    @PrePersist
    void beforeInsert() {
        criadoEm = Instant.now();
    }

    public LecComment() {}

    public LecComment(Lec lec, String questionId, String texto) {
        this.lec = lec;
        this.questionId = questionId;
        this.texto = texto;
    }

    public UUID getId() { return id; }
    public String getQuestionId() { return questionId; }
    public String getTexto() { return texto; }
    public boolean isResolvido() { return resolvido; }
    public Instant getCriadoEm() { return criadoEm; }
}
