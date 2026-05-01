package com.cryptowatch.backend.dto.error;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ApiError {
    private boolean success;                
    private int status;                     
    private String error;                   
    private String message;                 
    private String path;                    
    private LocalDateTime timestamp;        
    private List<String> details;           
}