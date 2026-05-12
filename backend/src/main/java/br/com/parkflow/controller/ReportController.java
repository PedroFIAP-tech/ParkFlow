package br.com.parkflow.controller;

import br.com.parkflow.dto.report.OperationalOverviewResponse;
import br.com.parkflow.service.ReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/overview")
    public OperationalOverviewResponse overview() {
        return reportService.operationalOverview();
    }
}
