package com.hotel.booking.common.controller;

import com.hotel.booking.user.entity.User;
import com.hotel.booking.user.repository.UserRepository;
import com.hotel.booking.notice.service.NoticeService;
import com.hotel.booking.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.ArrayList;

@Slf4j
@Controller
@RequiredArgsConstructor
public class HomeController {
    
    private final RoomService roomService;
    private final NoticeService noticeService;
    private final UserRepository userRepository;
    
    @GetMapping("/")
    public String home(Authentication authentication, Model model) {
        try {
            if (authentication != null && authentication.isAuthenticated()) {
                String username = authentication.getName();
                User user = userRepository.findByUsername(username).orElse(null);
                
                if (user != null && user.getRole() == User.Role.ADMIN) {
                    return "redirect:/admin/dashboard";
                }
                
                // 로그인한 사용자 정보를 모델에 추가
                if (user != null) {
                    model.addAttribute("user", user);
                }
            }
            
            try {
                model.addAttribute("rooms", roomService.getAllActiveRooms());
            } catch (Exception e) {
                log.error("객실 목록 조회 중 오류 발생", e);
                model.addAttribute("rooms", new ArrayList<>());
            }
            
            try {
                model.addAttribute("notices", noticeService.getActiveNotices());
            } catch (Exception e) {
                log.error("공지사항 목록 조회 중 오류 발생", e);
                model.addAttribute("notices", new ArrayList<>());
            }
            
            return "index";
        } catch (Exception e) {
            log.error("홈 페이지 로딩 중 오류 발생", e);
            model.addAttribute("error", "페이지를 불러오는 중 오류가 발생했습니다.");
            model.addAttribute("rooms", new ArrayList<>());
            model.addAttribute("notices", new ArrayList<>());
            return "index";
        }
    }
    
    @GetMapping("/login")
    public String login() {
        return "login";
    }
}

