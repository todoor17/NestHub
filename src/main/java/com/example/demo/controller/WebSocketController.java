package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // This method will trigger a reload signal for the frontend
    @MessageMapping("/reloadPosts")
    public void reloadPosts() {
        // Broadcast the reload signal to all connected clients
        messagingTemplate.convertAndSend("/topic/reload", "reload");
    }

    @MessageMapping("/reloadFriendshipButton")
    public void reloadFriendshipButton() {
        messagingTemplate.convertAndSend("/topic/reloadFriendshipButton", "reload");
    }

    @MessageMapping("/reloadChat")
    public void reloadChat() {
        messagingTemplate.convertAndSend("/topic/reloadChat", "reload chat");
    }
}