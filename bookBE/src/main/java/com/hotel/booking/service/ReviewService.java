package com.hotel.booking.service;

import com.hotel.booking.dto.ReviewDTO;
import com.hotel.booking.dto.ReviewRequest;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Review;
import com.hotel.booking.entity.User;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.ReviewRepository;
import com.hotel.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewDTO createReview(String userId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("리뷰를 작성할 권한이 없습니다");
        }

        if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
            throw new RuntimeException("완료된 예약에만 리뷰를 작성할 수 있습니다");
        }

        if (reviewRepository.existsByBookingId(booking.getId())) {
            throw new RuntimeException("이미 리뷰를 작성한 예약입니다");
        }

        Review review = Review.builder()
                .user(user)
                .room(booking.getRoom())
                .booking(booking)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        review = reviewRepository.save(review);
        return convertToDTO(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewDTO> getRoomReviews(Long roomId) {
        return reviewRepository.findByRoomId(roomId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewDTO> getUserReviews(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        return reviewRepository.findByUser(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ReviewDTO convertToDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getNickname())
                .roomId(review.getRoom().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}

