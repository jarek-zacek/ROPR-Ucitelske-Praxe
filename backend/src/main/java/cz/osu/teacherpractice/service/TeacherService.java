package cz.osu.teacherpractice.service;

import cz.osu.teacherpractice.domain.PracticeDomain;
import cz.osu.teacherpractice.dto.request.NewPracticeDto;
import cz.osu.teacherpractice.dto.response.ReviewDto;
import cz.osu.teacherpractice.dto.response.StudentPracticeDto;
import cz.osu.teacherpractice.exception.ServerErrorException;
import cz.osu.teacherpractice.exception.UserErrorException;
import cz.osu.teacherpractice.mapper.MapStructMapper;
import cz.osu.teacherpractice.model.Practice;
import cz.osu.teacherpractice.model.Review;
import cz.osu.teacherpractice.model.Role;
import cz.osu.teacherpractice.model.User;
import cz.osu.teacherpractice.repository.PracticeRepository;
import cz.osu.teacherpractice.repository.ReviewRepository;
import cz.osu.teacherpractice.repository.SubjectRepository;
import cz.osu.teacherpractice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service @RequiredArgsConstructor
public class TeacherService {

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final PracticeRepository practiceRepository;
    private final ReviewRepository reviewRepository;
    private final MapStructMapper mapper;

    private final UserService userService;

    public void addPractice(String teacherUsername, NewPracticeDto newPracticeDto) {
        User teacher = userRepository.findByEmail(teacherUsername).orElseThrow(() -> new ServerErrorException(
                "Učitel '" + teacherUsername + "' nenalezen."
        ));

        subjectRepository.findById(newPracticeDto.getSubject().getId()).orElseThrow(() -> new UserErrorException(
                "Předmět '" + newPracticeDto.getSubject().getName() + "' nenalezen.",
                "subject.id"
        ));

        Practice practice = mapper.newPracticeDtoToPractice(newPracticeDto);
        practice.setTeacher(teacher);
        practiceRepository.save(practice);
    }
    public List<StudentPracticeDto> getPracticesList(String teacherUsername, LocalDate date, Long subjectId, Pageable pageable) {
        User teacher = userRepository.findByEmail(teacherUsername).orElseThrow(() -> new ServerErrorException(
                "Učitel '" + teacherUsername + "' nenalezen."
        ));
        Long teacherId = teacher.getId();

        List<Practice> practices = practiceRepository.findAllByParamsAsListByTeacher(date, subjectId, teacherId, pageable);
        //sort practices by date
        practices.sort((p1, p2) -> p1.getDate().compareTo(p2.getDate()));
        List<PracticeDomain> practicesDomain = mapper.practicesToPracticesDomain(practices);

        List<PracticeDomain> toDelete = new ArrayList<>();

        practicesDomain.forEach(p -> {
            p.setNumberOfReservedStudents();
            p.setStudentNames(getStudentNamesByPractice(p, pageable));
            p.setFileNames(userService.getTeacherFiles(p.getTeacher().getUsername()));
            toDelete.add(p);
        });

        for (PracticeDomain practiceDomain : toDelete) {
            if (practiceDomain.removeNotPassedPractices()) {
                practicesDomain.remove(practiceDomain);
            }
        }

        return mapper.practicesDomainToStudentPracticesDto(practicesDomain);
    }

    public List<StudentPracticeDto> getPracticesListPast(String teacherUsername, LocalDate date, Long subjectId, Pageable pageable) {
        User teacher = userRepository.findByEmail(teacherUsername).orElseThrow(() -> new ServerErrorException(
                "Učitel '" + teacherUsername + "' nenalezen."
        ));
        Long teacherId = teacher.getId();
        List<Practice> practices = practiceRepository.findAllByParamsAsListByTeacher(date, subjectId, teacherId, pageable);
        //sort practices by date
        practices.sort((p1, p2) -> p1.getDate().compareTo(p2.getDate()));

        List<PracticeDomain> practicesDomain = mapper.practicesToPracticesDomain(practices);
        List<PracticeDomain> toDelete = new ArrayList<>();

        practicesDomain.forEach(p -> {
            p.setNumberOfReservedStudents();
            p.setStudentNames(getStudentNamesByPractice(p, pageable));
            p.setFileNames(userService.getTeacherFiles(p.getTeacher().getUsername()));
            String report = userService.getPracticeReport(p.getId());
            p.setReport(report);
            toDelete.add(p);
        });

        for (PracticeDomain practiceDomain : toDelete) {
            if (practiceDomain.removePassedPractices()) {
                practicesDomain.remove(practiceDomain);
            }
        }
        return mapper.practicesDomainToStudentPracticesDto(practicesDomain);
    }

    public List<String> getStudentNamesByPractice(PracticeDomain p, Pageable pageable) {
        List<Long> ids = userRepository.findAllStudentIdsByStudentPracticeIds(p.getId(), pageable);
        List<String> names = new ArrayList<>();
        for (Long id : ids) {
            User u = userRepository.findUserById(id);
            String name = u.getFirstName() + " " + u.getSecondName() + " (" + u.getUsername() + ")";
            names.add(name);
        }
        return names;
    }

    public List<Map<Long, List<ReviewDto>>> getStudentReviews(String username) {

        Optional<User> u = userRepository.findByEmail(username);
        List<Map<Long, List<ReviewDto>>> mappedReviews = new ArrayList<>();

        if(u.isPresent()){
            List<Practice> practices = practiceRepository.findAllByTeacherUsername(username);

            for (Practice practice :
                    practices) {

                List<Review> revs = reviewRepository.getAllByPracticeId(practice.getId());

                List<ReviewDto> ret = new ArrayList<>();
                for (Review rev :
                        revs) {
                    ReviewDto revDto = new ReviewDto();
                    revDto.setPracticeId(practice.getId());
                    revDto.setName(rev.getStudent().getFirstName() + " " + rev.getStudent().getSecondName());
                    revDto.setReviewText(rev.getText());
                    ret.add(revDto);
                }
                mappedReviews.add(Map.of(practice.getId(), ret));
            }
        }
        return mappedReviews;
    }
}
