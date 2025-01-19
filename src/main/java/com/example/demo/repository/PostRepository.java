package com.example.demo.repository;

import com.example.demo.entity.Post;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    @Query("""
           SELECT p
           FROM Post p
           WHERE p.userId = :userId
              OR p.userId IN (
                  SELECT f.userId2
                  FROM Friendship f
                  WHERE f.userId1 = :userId
                    AND f.status = 'accepted'
              )
              OR p.userId IN (
                  SELECT f.userId1
                  FROM Friendship f
                  WHERE f.userId2 = :userId
                    AND f.status = 'accepted'
              )
           ORDER BY p.postId DESC
           """)
    List<Post> findUserAndFriendsPosts(@Param("userId") Long userId);

    @Query("SELECT u FROM Post u WHERE u.authorUsername = :username")
    List<Post> findPostByUsername(@Param("username") String username);

    @Modifying
    @Query("DELETE FROM Post p WHERE p.userId = :userId")
    void deletePostsById(@Param("userId") Long userId);
}
