package com.hotel.booking.service;

import com.hotel.booking.dto.RoomDTO;
import com.hotel.booking.entity.Room;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public List<RoomDTO> getAllRooms() {
        return roomRepository.findByAvailableTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RoomDTO> getAvailableRooms(LocalDate checkInDate, LocalDate checkOutDate) {
        if (checkInDate == null || checkOutDate == null) {
            return getAllRooms();
        }
        return roomRepository.findAvailableRooms(checkInDate, checkOutDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoomDTO getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("객실을 찾을 수 없습니다"));
        return convertToDTO(room);
    }

    private RoomDTO convertToDTO(Room room) {
        List<com.hotel.booking.entity.Review> reviews = reviewRepository.findByRoomId(room.getId());
        Double averageRating = reviews.isEmpty() ? null : 
            reviews.stream().mapToInt(com.hotel.booking.entity.Review::getRating).average().orElse(0.0);

        return RoomDTO.builder()
                .id(room.getId())
                .name(room.getName())
                .description(room.getDescription())
                .type(room.getType())
                .capacity(room.getCapacity())
                .pricePerNight(room.getPricePerNight())
                .available(room.getAvailable())
                .imageUrl(room.getImageUrl())
                .averageRating(averageRating)
                .reviewCount(reviews.size())
                .build();
    }
}

