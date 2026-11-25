package br.gov.serpro.lec.domain.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "lec")
public class Lec {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_lec")
    private UUID idLec;

    @Column(name = "nome_solucao", nullable = false, length = 150)
    private String nomeSolucao;

    @Column(name = "grupo_classificacao", length = 100)
    private String grupoClassificacao;

    @Column(name = "tipo_solucao", length = 150)
    private String tipoSolucao;

    @Column(name = "subtipo_solucao", length = 150)
    private String subtipoSolucao;

    @Column(name = "especialista_responsavel", length = 150)
    private String especialistaResponsavel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusLec status = StatusLec.RASCUNHO;

    @Version
    @Column(nullable = false)
    private Integer versao;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    @Column(name = "parecer_devolucao", columnDefinition = "text")
    private String parecerDevolucao;

    @Column(name = "plano_execucao", columnDefinition = "text")
    private String planoExecucao;

    @OneToMany(mappedBy = "lec", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LecAnswer> respostas = new ArrayList<>();

    @OneToMany(mappedBy = "lec", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("criadoEm ASC")
    private List<LecComment> comentarios = new ArrayList<>();

    @PrePersist
    void beforeInsert() {
        Instant now = Instant.now();
        criadoEm = now;
        atualizadoEm = now;
    }

    @PreUpdate
    void beforeUpdate() {
        atualizadoEm = Instant.now();
    }

    public UUID getIdLec() { return idLec; }
    public String getNomeSolucao() { return nomeSolucao; }
    public void setNomeSolucao(String nomeSolucao) { this.nomeSolucao = nomeSolucao; }
    public String getGrupoClassificacao() { return grupoClassificacao; }
    public void setGrupoClassificacao(String grupoClassificacao) { this.grupoClassificacao = grupoClassificacao; }
    public String getTipoSolucao() { return tipoSolucao; }
    public void setTipoSolucao(String tipoSolucao) { this.tipoSolucao = tipoSolucao; }
    public String getSubtipoSolucao() { return subtipoSolucao; }
    public void setSubtipoSolucao(String subtipoSolucao) { this.subtipoSolucao = subtipoSolucao; }
    public String getEspecialistaResponsavel() { return especialistaResponsavel; }
    public void setEspecialistaResponsavel(String especialistaResponsavel) { this.especialistaResponsavel = especialistaResponsavel; }
    public StatusLec getStatus() { return status; }
    public void setStatus(StatusLec status) { this.status = status; }
    public Integer getVersao() { return versao; }
    public Instant getCriadoEm() { return criadoEm; }
    public Instant getAtualizadoEm() { return atualizadoEm; }
    public String getParecerDevolucao() { return parecerDevolucao; }
    public void setParecerDevolucao(String parecerDevolucao) { this.parecerDevolucao = parecerDevolucao; }
    public String getPlanoExecucao() { return planoExecucao; }
    public void setPlanoExecucao(String planoExecucao) { this.planoExecucao = planoExecucao; }
    public List<LecAnswer> getRespostas() { return respostas; }
    public List<LecComment> getComentarios() { return comentarios; }
}
