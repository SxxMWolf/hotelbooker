package com.hotel.booking.controller;

import com.hotel.booking.dto.ForgotIdRequest;
import com.hotel.booking.service.IdRecoveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class IdRecoveryController {
    private final IdRecoveryService idRecoveryService;

    /**
     * 아이디 찾기: 이메일로 아이디 전송
     */
    @PostMapping("/forgot-id")
    public ResponseEntity<?> forgotId(@RequestBody @Valid ForgotIdRequest request) {
        idRecoveryService.sendLoginIdByEmail(request.getEmail());
        // 존재 유무를 노출하지 않기 위해 항상 동일 메시지
        return ResponseEntity.ok("해당 이메일로 안내 메일을 확인해 주세요.");
    }
}

