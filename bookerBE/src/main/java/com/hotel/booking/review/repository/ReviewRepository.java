package com.hotel.booking.review.repository;

import com.hotel.booking.review.entity.Review;
import com.hotel.booking.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRoomAndVisibleTrueOrderByReviewDateDesc(Room room);
    List<Review> findByVisibleTrueOrderByReviewDateDesc();
    List<Review> findByVisibleFalseOrderByReviewDateDesc();
    List<Review> findByBooking_BookingId(Long bookingId);
    List<Review> findByUser_UserId(Long userId);
}

