package com.hotel.booking.review.service;

import com.hotel.booking.booking.entity.Booking;
import com.hotel.booking.review.entity.Review;
import com.hotel.booking.room.entity.Room;
import com.hotel.booking.user.entity.User;
import com.hotel.booking.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    
    public List<Review> getVisibleReviewsByRoom(Room room) {
        return reviewRepository.findByRoomAndVisibleTrueOrderByReviewDateDesc(room);
    }
    
    public List<Review> getAllVisibleReviews() {
        return reviewRepository.findByVisibleTrueOrderByReviewDateDesc();
    }
    
    public List<Review> getHiddenReviews() {
        return reviewRepository.findByVisibleFalseOrderByReviewDateDesc();
    }
    
    public Optional<Review> getReviewById(Long reviewId) {
        return reviewRepository.findById(reviewId);
    }
    
    public List<Review> getReviewsByBookingId(Long bookingId) {
        return reviewRepository.findByBooking_BookingId(bookingId);
    }
    
    public boolean hasReviewForBooking(Long bookingId, Long userId) {
        return reviewRepository.findByBooking_BookingId(bookingId).stream()
                .anyMatch(r -> r.getUser().getUserId().equals(userId));
    }
    
    @Transactional
    public Review createReview(Booking booking, User user, Room room, 
                              Integer rating, String comment) {
        Review review = Review.builder()
                .booking(booking)
                .user(user)
                .room(room)
                .rating(rating)
                .comment(comment)
                .visible(true)
                .build();
        
        return reviewRepository.save(review);
    }
    
    @Transactional
    public Review updateReviewVisibility(Long reviewId, Boolean visible) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        review.setVisible(visible);
        return reviewRepository.save(review);
    }
    
    @Transactional
    public Review addAdminReply(Long reviewId, String adminReply) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        review.setAdminReply(adminReply);
        review.setAdminReplyDate(java.time.LocalDateTime.now());
        return reviewRepository.save(review);
    }
}

