package com.cryptowatch.backend.controller;

import com.cryptowatch.backend.dto.response.ExportDataResponse;
import com.cryptowatch.backend.dto.response.ImportDataResponse;
import com.cryptowatch.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/export")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ExportDataResponse> exportData() {
        ExportDataResponse response = adminService.exportAllData();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/import")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ImportDataResponse> importData(@RequestParam("file") MultipartFile file) {
        ImportDataResponse response = adminService.importData(file);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}