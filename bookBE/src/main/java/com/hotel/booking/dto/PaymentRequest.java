package com.hotel.booking.dto;

import com.hotel.booking.entity.Payment;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentRequest {
    @NotNull(message = "예약 ID는 필수입니다")
    private Long bookingId;

    @NotNull(message = "결제 방법은 필수입니다")
    private Payment.PaymentMethod method;
}

