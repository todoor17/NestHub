package com.example.demo.controller;

import com.example.demo.entity.Post;
import com.example.demo.entity.User;
import com.example.demo.service.FriendshipService;
import com.example.demo.service.PostService;
import com.example.demo.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.List;
import java.util.Map;

@Controller
public class LoggedController {
    @Autowired
    public UserService userService;
    @Autowired
    public PostService postService;
    @Autowired
    private FriendshipService friendshipService;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private User validateSession(HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user == null) {
            throw new RuntimeException("User not logged in");
        }
        return user;
    }

    @GetMapping("/dashboard")
    public RedirectView redirectToUser(HttpSession session) {
        User loggedUser = (User) session.getAttribute("loggedInUser");
        if (loggedUser == null) {
            return new RedirectView("/login");
        }
        return new RedirectView("/" + loggedUser.getUsername());
    }

    @GetMapping("/{username}")
    public String loggedIn(@PathVariable String username, HttpSession session) {
        User user = validateSession(session);
        if (!user.getUsername().equals(username)) {
            return "redirect:/login";
        } else {
            return "logged";
        }
    }

    @GetMapping("/{username}/profile")
    public String profile(@PathVariable String username, HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user == null || !user.getUsername().equals(username)) {
            return String.format("redirect:/%s", username);
        } else {
            return "profile";
        }
    }

    @GetMapping("/api/getUser")
    @ResponseBody
    public User getUser(HttpSession session) {
        return validateSession(session);
    }

    @GetMapping("/api/getUsers")
    @ResponseBody
    public List<User> getFirstAndLastNames(HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user == null) {
            throw new RuntimeException("User not logged in");
        }

//        messagingTemplate.convertAndSend("/topic/reload", "reload"); // Send the reload signal

        return userService.getAllUsers();
    }

    @PostMapping("/api/savePost")
    @ResponseBody
    public String savePost(@RequestBody Post post) {
        postService.savePost(post);
        messagingTemplate.convertAndSend("/topic/reload", "SAVED POST"); // Send the reload signal
        return "Success";
    }

    @GetMapping("/api/getAllPosts")
    @ResponseBody
    public List<Post> getAllPosts(@RequestParam Long userId) {
        return postService.getAllUserAndFriendsPosts(userId);
    }

    @PostMapping("/api/sendFriendRequest")
    @ResponseBody
    public String sendFriendRequest(@RequestBody Map<String, String> payload) {
        Long senderId = Long.parseLong(payload.get("senderId"));
        Long receiverId = Long.parseLong(payload.get("receiverId"));

        messagingTemplate.convertAndSend("/topic/reloadFriendshipButton", "SENT FRIEND REQUEST");

        if (!friendshipService.checkFriendship(senderId, receiverId)) {
            friendshipService.addFriendRequest(senderId, receiverId);
            return "Success";
        }
        return "Fail";
    }

    @GetMapping("/api/checkRequest")
    @ResponseBody
    public String checkRequest(@RequestParam("senderId") Long senderId, @RequestParam("receiverId") Long receiverId) {
        if (friendshipService.checkRequest(senderId, receiverId)) {
            return "True";
        }
        return "False";
    }
}
