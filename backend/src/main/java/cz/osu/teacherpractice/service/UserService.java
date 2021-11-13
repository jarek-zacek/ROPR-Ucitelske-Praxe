package cz.osu.teacherpractice.service;

import cz.osu.teacherpractice.model.User;

import java.util.List;

public interface UserService {
    User saveUser(User user);
    User getUser(Long id);
    List<User> getUsers(); // maybe change to return a page of users (not all users) later
}
