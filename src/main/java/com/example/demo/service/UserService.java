package com.example.demo.service;

import com.example.demo.repository.UserRepository;
import com.example.demo.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Transactional
    public String saveUser(User user) {
        if (checkExistingUser(user.getEmail(), user.getUsername())) {
            return "Existing user";
        } else {
            userRepository.save(user);
            return "New user";
        }
    }

    @Transactional
    public boolean checkLogin(String username, String password) {
        return (userRepository.findByUsernameAndPassword(username, password).isPresent());
    }

    public boolean checkExistingUser(String email, String username) {
        return (userRepository.findByEmail(email).isPresent() || userRepository.findByUsername(username).isPresent());
    }

    public Optional<User> getUser(String username) {
        return userRepository.findByUsername(username);
    }

    public List<User> getAllUsers() {
        return userRepository.getAllUsers();
    }

    public User getUserById(Long id) {
        return userRepository.getUserById(id);
    }

    public boolean checkPassword(String password, Long userId) {
        return userRepository.existsByPasswordAndId(password, userId);
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }
}
