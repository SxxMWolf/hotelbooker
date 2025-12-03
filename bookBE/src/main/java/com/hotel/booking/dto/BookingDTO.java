package com.hotel.booking.dto;

import com.hotel.booking.entity.Booking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDTO {
    private Long id;
    private String userId;
    private Long roomId;
    private String roomName;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer guests;
    private BigDecimal totalPrice;
    private Booking.BookingStatus status;
    private LocalDateTime createdAt;
    private PaymentDTO payment;
}

