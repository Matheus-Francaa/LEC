package br.gov.serpro.lec.domain.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lec_question")
public class Question {

    @Id
    @Column(length = 40)
    private String id;

    @Column(nullable = false, length = 20)
    private String secao;

    @Column(nullable = false, length = 20)
    private String codigo;

    @Column(nullable = false, columnDefinition = "text")
    private String enunciado;

    @Column(name = "tipo_resposta", nullable = false, length = 20)
    private String tipoResposta;

    @Column(nullable = false)
    private boolean obrigatoria;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "lec_question_option", joinColumns = @JoinColumn(name = "question_id"))
    @OrderColumn(name = "option_order")
    @Column(name = "option_value", nullable = false, length = 100)
    private List<String> opcoes = new ArrayList<>();

    protected Question() {}

    public String getId() { return id; }
    public String getSecao() { return secao; }
    public String getCodigo() { return codigo; }
    public String getEnunciado() { return enunciado; }
    public String getTipoResposta() { return tipoResposta; }
    public boolean isObrigatoria() { return obrigatoria; }
    public List<String> getOpcoes() { return opcoes; }
}
