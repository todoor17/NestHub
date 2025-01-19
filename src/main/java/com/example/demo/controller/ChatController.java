package com.example.demo.controller;

import com.example.demo.entity.Message;
import com.example.demo.repository.ChatRepository;
import com.example.demo.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Controller
public class ChatController {
    private final ChatRepository chatRepository;
    private final ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatRepository chatRepository, ChatService chatService) {
        this.chatRepository = chatRepository;
        this.chatService = chatService;
    }

    @GetMapping("/chat")
    public String getChat(@RequestParam Long senderId, @RequestParam Long receiverId) {
        return "chat";
    }

    @GetMapping("/api/getMessages")
    @ResponseBody
    public List<Message> getMessages(@RequestParam Long senderId, @RequestParam Long receiverId) {
        List<Message> messages = chatService.getMessages(senderId, receiverId);
        messages.forEach(message -> {
            System.out.println(message.getMessage());
        });
        return messages;
    }

    @PostMapping("/api/sendMessage")
    @ResponseBody
    public String sendMessage(@RequestBody Map<String, String> payload) {
        Long senderId = Long.parseLong(payload.get("senderId"));
        Long receiverId = Long.parseLong(payload.get("receiverId"));
        String message = payload.get("message");
        String sentTime = payload.get("sentTime");

        chatService.insertMessage(senderId, receiverId, message, sentTime);
        messagingTemplate.convertAndSend("/topic/reloadChat", "reload chat");

        return "Success";
    }
}
