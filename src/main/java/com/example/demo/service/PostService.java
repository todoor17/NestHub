package com.example.demo.service;

import com.example.demo.repository.PostRepository;
import com.example.demo.entity.Post;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {
    @Autowired
    PostRepository postRepository;

    public void savePost(Post post) {
        postRepository.save(post);
    }

    public List<Post> getAllUserAndFriendsPosts(Long userId) {
        return postRepository.findUserAndFriendsPosts(userId);
    }

    public List<Post> getAllPostsByUsername(String username) {
        return postRepository.findPostByUsername(username);
    }

    @Transactional
    public void deleteUserPosts(Long userId) {
        postRepository.deletePostsById(userId);
    }
}
