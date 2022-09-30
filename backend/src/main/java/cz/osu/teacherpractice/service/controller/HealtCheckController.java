package cz.osu.teacherpractice.service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Calendar;

@RestController
@RequestMapping("/healthCheck")
public class HealtCheckController {

    @GetMapping("/ping")
    public String checkState() {
        return Calendar.getInstance().getTime() + " - I am alive.";
    }
}
