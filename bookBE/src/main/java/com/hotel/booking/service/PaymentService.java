package com.hotel.booking.service;

import com.hotel.booking.dto.PaymentDTO;
import com.hotel.booking.dto.PaymentRequest;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Payment;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public PaymentDTO processPayment(String userId, PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("결제할 권한이 없습니다");
        }

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("결제 가능한 상태가 아닙니다");
        }

        // 이미 결제가 있는지 확인
        if (paymentRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new RuntimeException("이미 결제가 완료된 예약입니다");
        }

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalPrice())
                .method(request.getMethod())
                .status(Payment.PaymentStatus.COMPLETED)
                .paymentDate(LocalDateTime.now())
                .transactionId(UUID.randomUUID().toString())
                .build();

        payment = paymentRepository.save(payment);

        // 예약 상태 업데이트
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        return convertToDTO(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentDTO> getUserPayments(String userId) {
        // User를 통해 해당 사용자의 모든 예약을 찾고, 그 예약들의 결제를 가져옴
        return paymentRepository.findAll().stream()
                .filter(payment -> payment.getBooking().getUser().getId().equals(userId))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentDTO getPaymentByBookingId(Long bookingId, String userId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("결제 정보를 찾을 수 없습니다"));

        if (!payment.getBooking().getUser().getId().equals(userId)) {
            throw new RuntimeException("결제 정보에 접근할 권한이 없습니다");
        }

        return convertToDTO(payment);
    }

    private PaymentDTO convertToDTO(Payment payment) {
        return PaymentDTO.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .paymentDate(payment.getPaymentDate())
                .transactionId(payment.getTransactionId())
                .build();
    }
}

