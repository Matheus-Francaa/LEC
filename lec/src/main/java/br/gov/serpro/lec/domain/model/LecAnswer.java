package br.gov.serpro.lec.domain.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "lec_answer", uniqueConstraints = @UniqueConstraint(
        name = "uk_lec_answer_question", columnNames = {"lec_id", "question_id"}))
public class LecAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lec_id", nullable = false)
    private Lec lec;

    @Column(name = "question_id", nullable = false, length = 40)
    private String questionId;

    @Column(name = "answer_value", nullable = false, columnDefinition = "text")
    private String value;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    void updateTimestamp() {
        updatedAt = Instant.now();
    }

    public LecAnswer() {}

    public LecAnswer(Lec lec, String questionId, String value) {
        this.lec = lec;
        this.questionId = questionId;
        this.value = value;
    }

    public String getQuestionId() { return questionId; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
    public Instant getUpdatedAt() { return updatedAt; }
}
