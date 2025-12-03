package com.hotel.booking.controller;

import com.hotel.booking.dto.UserDTO;
import com.hotel.booking.service.UserService;
import com.hotel.booking.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMyProfile(HttpServletRequest httpRequest) {
        String userId = getUserIdFromRequest(httpRequest);
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateMyProfile(
            @RequestBody com.hotel.booking.dto.UserUpdateRequest request,
            HttpServletRequest httpRequest) {
        String userId = getUserIdFromRequest(httpRequest);
        return ResponseEntity.ok(userService.updateUserProfile(
                userId,
                request.getEmail(),
                request.getNickname(),
                request.getPassword()
        ));
    }

    @DeleteMapping("/me")
    public ResponseEntity<com.hotel.booking.dto.ApiResponse<?>> deleteMyAccount(HttpServletRequest httpRequest) {
        String userId = getUserIdFromRequest(httpRequest);
        userService.deleteUser(userId);
        return ResponseEntity.ok(new com.hotel.booking.dto.ApiResponse<>(true, null, "회원 탈퇴가 완료되었습니다."));
    }

    private String getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.getIdFromToken(token);
        }
        throw new RuntimeException("인증 토큰이 없습니다");
    }
}

