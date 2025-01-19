package com.example.demo.repository;


import com.example.demo.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface ChatRepository extends JpaRepository <Message, Long> {
    @Query("SELECT m FROM Message m WHERE (m.senderId = :senderId AND m.receiverId = :receiverId) " +
            "OR (m.senderId = :receiverId AND m.receiverId = :senderId) ORDER BY m.sentTime")
    public List<Message> getMessagesBySenderAndReceiver(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);

    @Modifying
    @Query(value = "INSERT INTO messages(sender_id, receiver_id, message, sent_time) VALUES" +
            "(:senderId, :receiverId, :message, :sentTime)", nativeQuery = true)
    public void insertMessage(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId, @Param("message") String message, @Param("sentTime") String sentTime);

    @Modifying
    @Query("DELETE FROM Message m WHERE m.senderId = :userId OR m.receiverId = :userId")
    public void deleteMessages(Long userId);
}
