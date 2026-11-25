package br.gov.serpro.lec.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "lec_classification_group")
public class ClassificationGroup {

    @Id
    @Column(length = 100)
    private String nome;

    @Column(name = "sort_order", nullable = false)
    private int ordem;

    protected ClassificationGroup() {}

    public String getNome() { return nome; }
}
