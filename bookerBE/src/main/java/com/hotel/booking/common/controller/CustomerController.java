package com.hotel.booking.common.controller;

import com.hotel.booking.booking.entity.Booking;
import com.hotel.booking.payment.entity.Payment;
import com.hotel.booking.room.entity.Room;
import com.hotel.booking.user.entity.User;
import com.hotel.booking.user.repository.UserRepository;
import com.hotel.booking.room.service.RoomService;
import com.hotel.booking.booking.service.BookingService;
import com.hotel.booking.payment.service.PaymentService;
import com.hotel.booking.review.service.ReviewService;
import com.hotel.booking.notice.service.NoticeService;
import com.hotel.booking.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Controller
@RequestMapping("/customer")
@RequiredArgsConstructor
public class CustomerController {
    
    private final RoomService roomService;
    private final BookingService bookingService;
    private final PaymentService paymentService;
    private final ReviewService reviewService;
    private final NoticeService noticeService;
    private final UserService userService;
    private final UserRepository userRepository;
    
    // 중복 코드 제거: 사용자 조회 헬퍼 메서드
    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
    
    @GetMapping("/rooms")
    public String rooms(@RequestParam(required = false) String checkIn,
                       @RequestParam(required = false) String checkOut,
                       Model model) {
        List<Room> rooms;
        if (checkIn != null && checkOut != null && !checkIn.isEmpty() && !checkOut.isEmpty()) {
            LocalDate checkInDate = LocalDate.parse(checkIn);
            LocalDate checkOutDate = LocalDate.parse(checkOut);
            rooms = roomService.getAvailableRooms(checkInDate, checkOutDate);
            model.addAttribute("checkIn", checkIn);
            model.addAttribute("checkOut", checkOut);
        } else {
            rooms = roomService.getAllActiveRooms();
        }
        
        model.addAttribute("rooms", rooms);
        return "customer/rooms";
    }
    
    @GetMapping("/rooms/{id}")
    public String roomDetail(@PathVariable Long id, Model model) {
        Room room = roomService.getRoomById(id)
                .orElseThrow(() -> new IllegalArgumentException("객실을 찾을 수 없습니다."));
        model.addAttribute("room", room);
        model.addAttribute("reviews", reviewService.getVisibleReviewsByRoom(room));
        return "customer/room-detail";
    }
    
    @PostMapping("/bookings")
    public String createBooking(Authentication authentication,
                               @RequestParam Long roomId,
                               @RequestParam String checkInDate,
                               @RequestParam String checkOutDate,
                               @RequestParam Integer numGuests,
                               @RequestParam(required = false) String specialRequests,
                               RedirectAttributes redirectAttributes) {
        try {
            User user = getCurrentUser(authentication);
            
            Booking booking = bookingService.createBooking(
                    user, roomId, LocalDate.parse(checkInDate), 
                    LocalDate.parse(checkOutDate), numGuests, specialRequests);
            
            return "redirect:/customer/bookings/" + booking.getBookingId() + "/payment";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/customer/rooms/" + roomId;
        }
    }
    
    @GetMapping("/bookings/{id}/payment")
    public String paymentForm(@PathVariable Long id, Authentication authentication, Model model) {
        Booking booking = bookingService.getBookingById(id)
                .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다."));
        
        User user = getCurrentUser(authentication);
        
        if (!booking.getUser().getUserId().equals(user.getUserId())) {
            throw new IllegalArgumentException("예약 접근 권한이 없습니다.");
        }
        
        model.addAttribute("booking", booking);
        return "customer/payment";
    }
    
    @PostMapping("/bookings/{id}/payment")
    public String processPayment(@PathVariable Long id,
                                @RequestParam String paymentMethod,
                                @RequestParam(required = false, defaultValue = "0") BigDecimal discountAmount,
                                RedirectAttributes redirectAttributes) {
        try {
            Booking booking = bookingService.getBookingById(id)
                    .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다."));
            
            Payment.PaymentMethod method = Payment.PaymentMethod.valueOf(paymentMethod);
            paymentService.processPayment(booking, method, discountAmount);
            
            redirectAttributes.addFlashAttribute("success", "결제가 완료되었습니다.");
            return "redirect:/customer/bookings";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/customer/bookings/" + id + "/payment";
        }
    }
    
    @GetMapping("/bookings")
    public String myBookings(Authentication authentication, Model model) {
        User user = getCurrentUser(authentication);
        
        List<Booking> bookings = bookingService.getUserBookings(user);
        model.addAttribute("bookings", bookings);
        return "customer/bookings";
    }
    
    @PostMapping("/bookings/{id}/cancel")
    public String cancelBooking(@PathVariable Long id, Authentication authentication,
                               RedirectAttributes redirectAttributes) {
        try {
            User user = getCurrentUser(authentication);
            
            bookingService.cancelBooking(id, user);
            redirectAttributes.addFlashAttribute("success", "예약이 취소되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/customer/bookings";
    }
    
    @GetMapping("/notices")
    public String notices(Model model) {
        model.addAttribute("notices", noticeService.getAllVisibleNotices());
        return "customer/notices";
    }
    
    @GetMapping("/notices/{id}")
    public String noticeDetail(@PathVariable Long id, Model model) {
        model.addAttribute("notice", noticeService.getNoticeById(id)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다.")));
        return "customer/notice-detail";
    }
    
    @GetMapping("/profile")
    public String profile(Authentication authentication, Model model) {
        User user = getCurrentUser(authentication);
        model.addAttribute("user", user);
        return "customer/profile";
    }
    
    @PostMapping("/profile")
    public String updateProfile(Authentication authentication,
                               @RequestParam String name,
                               @RequestParam String email,
                               RedirectAttributes redirectAttributes) {
        try {
            User user = getCurrentUser(authentication);
            userService.updateUser(user, name, email);
            redirectAttributes.addFlashAttribute("success", "프로필이 업데이트되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/customer/profile";
    }
    
    @GetMapping("/bookings/{id}/review")
    public String reviewForm(@PathVariable Long id, Authentication authentication, Model model) {
        Booking booking = bookingService.getBookingById(id)
                .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다."));
        model.addAttribute("booking", booking);
        return "customer/review-form";
    }
    
    @PostMapping("/bookings/{id}/review")
    public String submitReview(@PathVariable Long id,
                              @RequestParam Integer rating,
                              @RequestParam String comment,
                              Authentication authentication,
                              RedirectAttributes redirectAttributes) {
        try {
            Booking booking = bookingService.getBookingById(id)
                    .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다."));
            User user = getCurrentUser(authentication);
            
            reviewService.createReview(booking, user, booking.getRoom(), rating, comment);
            redirectAttributes.addFlashAttribute("success", "리뷰가 작성되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/customer/bookings";
    }
    
    @GetMapping("/mypage")
    public String myPage(Authentication authentication, Model model) {
        User user = getCurrentUser(authentication);
        
        List<Booking> allBookings = bookingService.getUserBookings(user);
        LocalDate today = LocalDate.now();
        
        // 현재 예약 (체크아웃 날짜가 오늘 이후인 예약 중 CONFIRMED, CHECKED_IN, PENDING 상태)
        List<Booking> currentBookings = allBookings.stream()
                .filter(b -> b.getCheckOutDate().isAfter(today) || b.getCheckOutDate().isEqual(today))
                .filter(b -> b.getStatus() != Booking.BookingStatus.CANCELLED && 
                            b.getStatus() != Booking.BookingStatus.CHECKED_OUT)
                .toList();
        
        // 과거 예약 (체크아웃 날짜가 오늘 이전이거나 CANCELLED, CHECKED_OUT 상태)
        List<Booking> pastBookings = allBookings.stream()
                .filter(b -> b.getCheckOutDate().isBefore(today) || 
                            b.getStatus() == Booking.BookingStatus.CANCELLED ||
                            b.getStatus() == Booking.BookingStatus.CHECKED_OUT)
                .toList();
        
        // 각 예약에 대한 결제 정보와 리뷰 작성 여부를 Map으로 저장
        java.util.Map<Long, Payment> paymentMap = new java.util.HashMap<>();
        java.util.Map<Long, Boolean> reviewMap = new java.util.HashMap<>();
        
        for (Booking booking : allBookings) {
            // 결제 정보
            paymentService.getPaymentByBookingId(booking.getBookingId())
                    .ifPresent(payment -> paymentMap.put(booking.getBookingId(), payment));
            
            // 리뷰 작성 여부 확인 (체크아웃 완료된 예약만)
            if (booking.getStatus() == Booking.BookingStatus.CHECKED_OUT) {
                boolean hasReview = reviewService.hasReviewForBooking(booking.getBookingId(), user.getUserId());
                reviewMap.put(booking.getBookingId(), hasReview);
            }
        }
        
        model.addAttribute("paymentMap", paymentMap);
        model.addAttribute("reviewMap", reviewMap);
        
        model.addAttribute("user", user);
        model.addAttribute("currentBookings", currentBookings);
        model.addAttribute("pastBookings", pastBookings);
        return "customer/mypage";
    }
    
    @PostMapping("/mypage/update-name")
    public String updateName(Authentication authentication,
                            @RequestParam String name,
                            RedirectAttributes redirectAttributes) {
        try {
            User user = getCurrentUser(authentication);
            user.setName(name);
            userRepository.save(user);
            redirectAttributes.addFlashAttribute("success", "이름이 변경되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/customer/mypage";
    }
    
    @PostMapping("/mypage/update-email")
    public String updateEmail(Authentication authentication,
                             @RequestParam String email,
                             RedirectAttributes redirectAttributes) {
        try {
            User user = getCurrentUser(authentication);
            
            // 이메일 중복 확인
            if (userRepository.existsByEmail(email) && !user.getEmail().equals(email)) {
                redirectAttributes.addFlashAttribute("error", "이미 사용 중인 이메일입니다.");
                return "redirect:/customer/mypage";
            }
            
            user.setEmail(email);
            userRepository.save(user);
            redirectAttributes.addFlashAttribute("success", "이메일이 변경되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/customer/mypage";
    }
    
    @PostMapping("/mypage/change-password")
    public String changePassword(Authentication authentication,
                                @RequestParam String currentPassword,
                                @RequestParam String newPassword,
                                @RequestParam String confirmPassword,
                                RedirectAttributes redirectAttributes) {
        try {
            User user = getCurrentUser(authentication);
            
            // 새 비밀번호 확인
            if (!newPassword.equals(confirmPassword)) {
                redirectAttributes.addFlashAttribute("error", "새 비밀번호가 일치하지 않습니다.");
                return "redirect:/customer/mypage";
            }
            
            // 현재 비밀번호 확인은 Spring Security의 PasswordEncoder를 사용
            userService.changePassword(user, newPassword);
            redirectAttributes.addFlashAttribute("success", "비밀번호가 변경되었습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/customer/mypage";
    }
    
    @GetMapping("/mypage/payment-history")
    public String paymentHistory(Authentication authentication, Model model) {
        User user = getCurrentUser(authentication);
        
        List<Booking> allBookings = bookingService.getUserBookings(user);
        java.util.List<java.util.Map<String, Object>> paymentHistory = new java.util.ArrayList<>();
        
        for (Booking booking : allBookings) {
            paymentService.getPaymentByBookingId(booking.getBookingId()).ifPresent(payment -> {
                java.util.Map<String, Object> paymentInfo = new java.util.HashMap<>();
                paymentInfo.put("booking", booking);
                paymentInfo.put("payment", payment);
                paymentHistory.add(paymentInfo);
            });
        }
        
        model.addAttribute("paymentHistory", paymentHistory);
        return "customer/payment-history";
    }
    
    @PostMapping("/mypage/delete-account")
    public String deleteAccount(Authentication authentication,
                               RedirectAttributes redirectAttributes) {
        try {
            User user = getCurrentUser(authentication);
            
            // 활성 예약이 있는지 확인
            List<Booking> activeBookings = bookingService.getUserBookings(user).stream()
                    .filter(b -> b.getStatus() != Booking.BookingStatus.CANCELLED && 
                               b.getStatus() != Booking.BookingStatus.CHECKED_OUT)
                    .filter(b -> b.getCheckOutDate().isAfter(LocalDate.now()) || 
                               b.getCheckOutDate().isEqual(LocalDate.now()))
                    .toList();
            
            if (!activeBookings.isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "활성 예약이 있어 회원탈퇴할 수 없습니다. 먼저 예약을 취소해주세요.");
                return "redirect:/customer/mypage";
            }
            
            // 계정 비활성화
            user.setEnabled(false);
            userRepository.save(user);
            
            redirectAttributes.addFlashAttribute("success", "회원탈퇴가 완료되었습니다.");
            return "redirect:/logout";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "회원탈퇴 중 오류가 발생했습니다: " + e.getMessage());
            return "redirect:/customer/mypage";
        }
    }
}

