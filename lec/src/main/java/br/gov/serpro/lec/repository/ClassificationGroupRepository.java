package br.gov.serpro.lec.repository;

import br.gov.serpro.lec.domain.model.ClassificationGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClassificationGroupRepository extends JpaRepository<ClassificationGroup, String> {
    List<ClassificationGroup> findAllByOrderByOrdemAsc();
}
