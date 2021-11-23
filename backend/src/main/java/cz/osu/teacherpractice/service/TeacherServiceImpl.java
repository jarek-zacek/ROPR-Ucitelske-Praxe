package cz.osu.teacherpractice.service;

import cz.osu.teacherpractice.exception.ResourceNotFoundException;
import cz.osu.teacherpractice.payload.request.NewPracticeRequest;
import cz.osu.teacherpractice.model.Practice;
import cz.osu.teacherpractice.model.Subject;
import cz.osu.teacherpractice.model.User;
import cz.osu.teacherpractice.repo.PracticeRepo;
import cz.osu.teacherpractice.repo.SubjectRepo;
import cz.osu.teacherpractice.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class TeacherServiceImpl implements TeacherService {

    private final UserRepo userRepo;
    private final SubjectRepo subjectRepo;
    private final PracticeRepo practiceRepo;

    @Override
    public void addPractice(String teacherUsername, NewPracticeRequest practiceRequest) {
        User teacher = userRepo.findByUsername(teacherUsername).orElseThrow(() -> new ResourceNotFoundException(
                "Teacher with username [" + teacherUsername + "] not found."
        ));

        Subject subject = subjectRepo.findById(practiceRequest.getSubjectId()).orElseThrow(() -> new ResourceNotFoundException(
                "Subject with id [" + practiceRequest.getSubjectId() + "] not found."
        ));

        Practice practice = new Practice();
        practice.setDate(practiceRequest.getDate());
        practice.setStart(practiceRequest.getStart());
        practice.setEnd(practiceRequest.getEnd());
        practice.setSubject(subject);
        practice.setTeacher(teacher);
        practiceRepo.save(practice);
    }
}
