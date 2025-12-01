package com.hotel.booking.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.ArrayList;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataAccessException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public String handleDataAccessException(DataAccessException e, Model model) {
        log.error("데이터베이스 접근 오류 발생", e);
        model.addAttribute("error", "데이터베이스 연결에 문제가 발생했습니다. 관리자에게 문의하세요.");
        model.addAttribute("rooms", new ArrayList<>());
        model.addAttribute("notices", new ArrayList<>());
        return "index";
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public String handleGenericException(Exception e, Model model) {
        log.error("예상치 못한 오류 발생", e);
        
        // 스택 트레이스의 첫 번째 줄만 표시 (실제 오류 원인)
        String errorMessage = "서버 오류가 발생했습니다.";
        if (e.getMessage() != null && !e.getMessage().isEmpty()) {
            errorMessage = "오류: " + e.getMessage();
            log.error("오류 상세 정보: {}", e.getMessage());
        }
        
        // 모든 예외의 스택 트레이스를 로그에 출력
        log.error("예외 스택 트레이스:", e);
        
        model.addAttribute("error", errorMessage);
        model.addAttribute("rooms", new ArrayList<>());
        model.addAttribute("notices", new ArrayList<>());
        return "error";
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public String handleAccessDeniedException(AccessDeniedException e, Model model) {
        log.warn("접근 거부: {}", e.getMessage());
        model.addAttribute("error", "접근 권한이 없습니다.");
        return "error";
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleNotFoundException(NoHandlerFoundException e, Model model) {
        log.warn("요청한 페이지를 찾을 수 없음: {}", e.getRequestURL());
        model.addAttribute("error", "요청한 페이지를 찾을 수 없습니다.");
        return "error";
    }
}

