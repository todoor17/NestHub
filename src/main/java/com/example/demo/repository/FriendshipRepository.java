package com.example.demo.repository;

import com.example.demo.entity.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    @Query("SELECT u.userId1 FROM Friendship u WHERE u.userId2 = :receiverId and u.status = 'Pending'")
    List<Long> findPendingRequests(@Param("receiverId") int receivedId);

    @Modifying
    @Query("UPDATE Friendship f SET f.status = 'accepted' where f.userId1 = :senderId and f.userId2 = :receiverId")
    void updateStatusToAccepted(@Param("senderId") long senderId, @Param("receiverId") long receiverId);

    @Query("""
    SELECT CASE 
        WHEN u.userId2 = :param THEN u.userId1 
        ELSE u.userId2 
    END 
    FROM Friendship u 
    WHERE (u.userId1 = :param OR u.userId2 = :param) AND u.status = 'accepted'
""")
    List<Long> findFriends(@Param("param") long userId);

    @Modifying
    @Query("DELETE FROM Friendship u WHERE u.userId1 = :sender AND u.userId2 = :receiver AND u.status = 'pending'")
    void deleteRequest(@Param("sender") Long senderId, @Param("receiver") Long receiverId);

    @Modifying
    @Query("DELETE FROM Friendship u WHERE (u.userId1 = :sender AND u.userId2 = :receiver OR u.userId1 = :receiver AND u.userId2 = :sender) AND u.status = 'accepted'")
    void deleteFriendship(@Param("sender") Long senderId, @Param("receiver") Long receiverId);

    @Modifying
    @Query(value = "INSERT INTO Friendships (user_id1, user_id2, status) VALUES (:sender, :receiver, 'pending')", nativeQuery = true)
    void addFriendRequest(@Param("sender") Long senderId, @Param("receiver") Long receiverId);

    boolean existsByUserId1AndUserId2(Long userId1, Long userId2);

    @Query("SELECT COUNT(u) FROM Friendship u WHERE " +
            "(u.userId1 = :sender AND u.userId2 = :receiver AND u.status = 'pending') OR " +
            "(u.userId1 = :receiver AND u.userId2 = :sender AND u.status = 'pending') OR " +
            "(u.userId1 = :sender AND u.userId2 = :receiver AND u.status = 'accepted') OR " +
            "(u.userId1 = :receiver AND u.userId2 = :sender AND u.status = 'accepted')"
    )
    int checkRequest(@Param("sender") Long senderId, @Param("receiver") Long receiverId);

    @Query("SELECT COUNT(u) FROM Friendship u WHERE (u.userId1 = :id AND u.status = 'accepted') OR (u.userId2 = :id AND u.status = 'accepted')")
    int getNrOfFriends(@Param("id") Long id);

    @Modifying
    @Query("DELETE FROM Friendship u WHERE u.userId1 = :userId or u.userId2 = :userId")
    void deleteFriendshipByUserId(@Param("userId") Long userId);
}
