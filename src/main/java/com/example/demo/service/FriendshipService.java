package com.example.demo.service;

import com.example.demo.repository.FriendshipRepository;
import com.example.demo.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FriendshipService {
    @Autowired
    private FriendshipRepository friendshipRepository;
    @Autowired
    private UserService userService;

    public List<Long> getPendingRequests(int receivedId) {
        return friendshipRepository.findPendingRequests(receivedId);
    }

    public List<User> getPendingUsers(List<Long> penidngIds) {
        List<User> pendingUsers = new ArrayList<>();
        for (Long id : penidngIds) {
            User user = userService.getUserById(id);
            pendingUsers.add(user);
        }
        return pendingUsers;
    }

    @Transactional
    public void updateStatusToAccepted(Long senderId, Long receiverId) {
        friendshipRepository.updateStatusToAccepted(senderId, receiverId);
    }

    public List<Long> getFriends(Long userId) {
        return friendshipRepository.findFriends(userId);
    }

    @Transactional
    public void deleteRequest(Long senderId, Long receiverId) {
        friendshipRepository.deleteRequest(senderId, receiverId);
    }

    @Transactional
    public void deleteFriendship(Long senderId, Long receiverId) {
        friendshipRepository.deleteFriendship(senderId, receiverId);
    }

    @Transactional
    public void addFriendRequest(Long senderId, Long receiverId) {
        friendshipRepository.addFriendRequest(senderId, receiverId);
    }

    public boolean checkFriendship(Long senderId, Long receiverId) {
        return friendshipRepository.existsByUserId1AndUserId2(senderId, receiverId);
    }

    public boolean checkRequest(Long senderId, Long receiverId) {
        return friendshipRepository.checkRequest(senderId, receiverId) > 0;
    }

    public Integer getNrOfFriends(Long userId) {
        return friendshipRepository.getNrOfFriends(userId);
    }

    @Transactional
    public void deleteUserFriendships(Long userId) {
        friendshipRepository.deleteFriendshipByUserId(userId);
    }
}
