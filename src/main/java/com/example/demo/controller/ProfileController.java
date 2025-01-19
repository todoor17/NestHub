package com.example.demo.controller;

import com.example.demo.entity.Post;
import com.example.demo.entity.User;
import com.example.demo.service.ChatService;
import com.example.demo.service.FriendshipService;
import com.example.demo.service.PostService;
import com.example.demo.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Controller
public class ProfileController {
    private final UserService userService;
    private final PostService postService;
    private final FriendshipService friendshipService;
    private final ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    public ProfileController(UserService userService, PostService postService, FriendshipService friendshipService, ChatService chatService) {
        this.userService = userService;
        this.postService = postService;
        this.friendshipService = friendshipService;
        this.chatService = chatService;
    }

    @PostMapping("/api/uploadPhoto")
    @ResponseBody
    public String uploadPhoto(@RequestParam("photo") MultipartFile photo, HttpSession session) throws IOException {
        User user = (User) session.getAttribute("loggedInUser");
        if (photo.isEmpty()) {
            return "No photo received";
        }
        String path = String.format("C:\\Java\\NestHub\\demo\\src\\main\\resources\\static\\images\\profilePhotos\\%s.png", user.getUsername());
        File file = new File(path);
        photo.transferTo(file);
        System.out.println("Hello");
        return "Success";
    }

    @GetMapping("/api/getProfilePhoto")
    @ResponseBody
    public String getProfilePhoto(@RequestParam String username) {
        String path = String.format("C:\\Java\\NestHub\\demo\\src\\main\\resources\\static\\images\\profilePhotos\\%s.png", username);
        File file = new File(path);
        if (file.exists()) {
            return String.format("/images/profilePhotos/%s.png", username);
        } else  {
            return "/images/profilePhotos/avatar.png";
        }
    }

    @GetMapping("/api/getPostsByUsername")
    @ResponseBody
    public List<Post> getPostsByUsername(@RequestParam String username) {
        return postService.getAllPostsByUsername(username);
    }

    @GetMapping("/api/getPendingRequests")
    @ResponseBody
    public List<User> getPendingUsers(@RequestParam int receiverId) {
        List<Long> pendingIds = friendshipService.getPendingRequests(receiverId);
        return friendshipService.getPendingUsers(pendingIds);
    }

    @PostMapping("/api/acceptRequest")
    @ResponseBody
    public String acceptRequest(@RequestBody Map<String, String> payload) {
        messagingTemplate.convertAndSend("/topic/reloadFriendshipButton", "ACCEPTED REQUEST");
        messagingTemplate.convertAndSend("/topic/reload", "RELOAD POSTS WHEN NEW FRIEND");

        Long senderId = Long.valueOf(payload.get("sender"));
        Long receiverId = Long.valueOf(payload.get("receiver"));
        friendshipService.updateStatusToAccepted(senderId, receiverId);
        return "Success";
    }

    @GetMapping("/api/getFriends")
    @ResponseBody
    public List<User> getFriends(@RequestParam Long loggedUserId) {
        List<User> friends = new ArrayList<>();
        List<Long> friendIds = friendshipService.getFriends(loggedUserId);
        for (Long friendId : friendIds) {
            friends.add(userService.getUserById(friendId));
        }
        return friends;
    }

    @PostMapping("/api/deleteRequest")
    @ResponseBody
    public void deleteRequest(@RequestBody Map<String, String> payload) {
        Long senderId = Long.valueOf(payload.get("senderId"));
        Long receiverId = Long.valueOf(payload.get("receiverId"));
        System.out.println(senderId + " " + receiverId);
        friendshipService.deleteRequest(senderId, receiverId);

        messagingTemplate.convertAndSend("/topic/reloadFriendshipButton", "DECLINED REQUEST");
    }

    @PostMapping("/api/deleteFriend")
    @ResponseBody
    public void deleteFriend(@RequestBody Map<String, String> payload) {
        messagingTemplate.convertAndSend("/topic/reloadFriendshipButton", "DELETED FRIEND");
        messagingTemplate.convertAndSend("/topic/reload", "RELOAD POSTS WHEN A FRIEND IS DELETED");
        Long senderId = Long.valueOf(payload.get("senderId"));
        Long receiverId = Long.valueOf(payload.get("receiverId"));
        friendshipService.deleteFriendship(senderId, receiverId);
    }

    @GetMapping("/api/getNrOfFriends")
    @ResponseBody
    public Integer getNrOfFriends(@RequestParam Long userId) {
        return friendshipService.getNrOfFriends(userId);
    }

    @PostMapping("/api/deleteUser")
    @ResponseBody
    public String deleteUser(@RequestBody Map<String, String> payload) {
        String password = payload.get("password");
        Long userId = Long.valueOf(payload.get("userId"));

        if (!userService.checkPassword(password, userId)) {
            return "Wrong password";
        }

        chatService.deleteMessages(userId);
        friendshipService.deleteUserFriendships(userId);
        postService.deleteUserPosts(userId);
        userService.deleteUser(userId);

        messagingTemplate.convertAndSend("/topic/reloadFriendshipButton", "DELETED USER");
        messagingTemplate.convertAndSend("/topic/reload", "DELETED USER");

        return "User deleted successfully";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "login";
    }
}

