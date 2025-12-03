package com.hotel.booking.service;

import com.hotel.booking.dto.BookingDTO;
import com.hotel.booking.dto.BookingRequest;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.User;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookingDTO createBooking(String userId, BookingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("객실을 찾을 수 없습니다"));

        if (!room.getAvailable()) {
            throw new RuntimeException("예약 가능한 객실이 아닙니다");
        }

        // 날짜 검증
        if (request.getCheckInDate().isAfter(request.getCheckOutDate()) || 
            request.getCheckInDate().isEqual(request.getCheckOutDate())) {
            throw new RuntimeException("체크아웃 날짜는 체크인 날짜보다 이후여야 합니다");
        }

        // 중복 예약 확인
        List<Room> availableRooms = roomRepository.findAvailableRooms(
                request.getCheckInDate(), request.getCheckOutDate());
        if (!availableRooms.contains(room)) {
            throw new RuntimeException("선택한 날짜에 예약 가능한 객실이 아닙니다");
        }

        // 총 가격 계산
        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal totalPrice = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .guests(request.getGuests())
                .totalPrice(totalPrice)
                .status(Booking.BookingStatus.PENDING)
                .build();

        booking = bookingRepository.save(booking);
        return convertToDTO(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getUserBookings(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        return bookingRepository.findByUser(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingDTO getBookingById(Long id, String userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다"));
        
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("예약 정보에 접근할 권한이 없습니다");
        }
        
        return convertToDTO(booking);
    }

    @Transactional
    public void cancelBooking(Long id, String userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다"));
        
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("예약을 취소할 권한이 없습니다");
        }
        
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("이미 취소된 예약입니다");
        }
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    private BookingDTO convertToDTO(Booking booking) {
        return BookingDTO.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .roomId(booking.getRoom().getId())
                .roomName(booking.getRoom().getName())
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .guests(booking.getGuests())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}

