package com.example.demo.service;

import com.example.demo.entity.Message;
import com.example.demo.repository.ChatRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {
    @Autowired
    private ChatRepository messageRepository;

    public List<Message> getMessages(Long senderId, Long receiverId) {
        List<Message> messages = messageRepository.getMessagesBySenderAndReceiver(senderId, receiverId);
        return messages;
    }

    @Transactional
    public void insertMessage(Long senderId, Long receiverId, String message, String sentTime) {
        messageRepository.insertMessage(senderId, receiverId, message, sentTime);
    }

    @Transactional
    public void deleteMessages(Long userId) {
        messageRepository.deleteMessages(userId);
    }
}
