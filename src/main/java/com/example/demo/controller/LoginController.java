package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Controller
public class LoginController {
    @Autowired
    UserService userService;

    @GetMapping("/login")
    public String signIn() {
        return "login";
    }

    @PostMapping("/login")
    @ResponseBody
    public Map<String, String> login(@RequestBody User user, HttpSession session) {
        Map<String, String> response = new HashMap<>();
        if (userService.checkLogin(user.getUsername(), user.getPassword())) {
            Optional<User> fullUser = userService.getUser(user.getUsername());
            if (fullUser.isPresent()) {
                session.setAttribute("loggedInUser", fullUser.get());
                response.put("status", "success");
                String url = String.format("/%s", user.getUsername());
                response.put("redirect", url);
            } else {
                response.put("status", "fail");
            }
        } else {
            response.put("status", "fail");
        }
        return response;
    }
 }
