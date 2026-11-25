package br.gov.serpro.lec.repository;

import br.gov.serpro.lec.domain.model.Lec;
import br.gov.serpro.lec.domain.model.StatusLec;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LecRepository extends JpaRepository<Lec, UUID> {
    List<Lec> findAllByOrderByAtualizadoEmDesc();
    List<Lec> findByStatusOrderByAtualizadoEmDesc(StatusLec status);
}
