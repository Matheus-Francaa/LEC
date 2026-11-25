package br.gov.serpro.lec.api.controller;

import br.gov.serpro.lec.api.dto.QuestionResponse;
import br.gov.serpro.lec.domain.service.LecService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/v1")
public class QuestionController {
    private final LecService lecService;

    public QuestionController(LecService lecService) {
        this.lecService = lecService;
    }

    @GetMapping("/questions")
    public List<QuestionResponse> questions() {
        return lecService.questions();
    }

    @GetMapping("/classification-groups")
    public List<String> classificationGroups() {
        return lecService.classificationGroups();
    }
}
