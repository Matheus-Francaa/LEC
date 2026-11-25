package br.gov.serpro.lec.repository;

import br.gov.serpro.lec.domain.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, String> {
    List<Question> findAllByOrderBySecaoAscCodigoAsc();
}
