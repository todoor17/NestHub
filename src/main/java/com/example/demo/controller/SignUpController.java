package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;

@Controller
public class SignUpController {
    @Autowired
    private UserService userService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/signUp")
    public String signUp() {
        return "signUp";
    }


    @PostMapping("/signUp")
    @ResponseBody
    public Map<String, String> getValues(@RequestBody User user) {
        messagingTemplate.convertAndSend("/topic/reloadFriendshipButton", "delete friend");
        Map<String, String> response = new HashMap<>();
        if (userService.saveUser(user).equals("New user")) {
            response.put("message", "User registered successfully");
            response.put("redirect", "/login");

        } else {
            response.put("message", "User already exists");
        }
        return response;
    }
}
