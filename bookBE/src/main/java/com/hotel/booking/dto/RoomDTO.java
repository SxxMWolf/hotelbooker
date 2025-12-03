package com.hotel.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomDTO {
    private Long id;
    private String name;
    private String description;
    private String type;
    private Integer capacity;
    private BigDecimal pricePerNight;
    private Boolean available;
    private String imageUrl;
    private Double averageRating;
    private Integer reviewCount;
}

