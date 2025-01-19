package com.example.demo.repository;

import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameAndPassword(@Param("username") String username, @Param("password") String password);

    @Query("SELECT u from User u")
    List<User> getAllUsers();

    User getUserById(Long id);

    boolean existsByPasswordAndId(String password, Long userId);

    @Modifying
    @Query("DELETE FROM User u WHERE u.id = :userId")
    void deleteUserById(@Param("userId") Long userId);
}