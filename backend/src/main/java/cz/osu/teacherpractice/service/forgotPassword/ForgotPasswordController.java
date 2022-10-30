package cz.osu.teacherpractice.service.forgotPassword;

import cz.osu.teacherpractice.dto.request.ForgotPasswordDto;
import cz.osu.teacherpractice.model.User;
import cz.osu.teacherpractice.repository.UserRepository;
import cz.osu.teacherpractice.service.UserService;
import cz.osu.teacherpractice.service.email.EmailService;
import cz.osu.teacherpractice.service.security.UserSecurityService;
import cz.osu.teacherpractice.service.token.forgotPasswordToken.PasswordResetTokenRepository;
import cz.osu.teacherpractice.service.token.registrationToken.ConfirmationToken;
import cz.osu.teacherpractice.service.token.registrationToken.ConfirmationTokenRepository;
import lombok.AllArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.*;

import static cz.osu.teacherpractice.config.AppConfig.baseDnsProduction;

@RestController
@RequestMapping(path = "/forgotPassword")
@AllArgsConstructor
public class ForgotPasswordController {


    private final UserService userService;
    private final UserRepository userRepository;
    private final ConfirmationTokenRepository confirmationTokenRepository;
    private final UserSecurityService securityService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final ForgotPasswordService forgotPasswordService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @CrossOrigin
    @PostMapping("/reset")
    public String resetPassword(HttpServletRequest request,
                                @RequestParam("email") String userEmail) {
        String result = userEmail.replaceAll("\"", "");
        User user = userService.getUserByUsername(result);
        if (user == null) {
            return "Na zadaný e-mail (pokud existuje) byl poslán odkaz pro obnovu hesla";
        }
        String token = UUID.randomUUID().toString();
        userService.createPasswordResetTokenForUser(user, token);
        String link = baseDnsProduction + "/login?forgotPasswordToken=" + token;
        new Thread(new Runnable() {
            public void run() {
                emailService.sendForgotPasswordMail(result, forgotPasswordService.buildEmail(user.getFirstName(), link));
            }
        }).start();
        return "Na zadaný e-mail (pokud existuje) byl poslán odkaz pro obnovu hesla";
    }

    @PostMapping("/save")
    public String savePassword(@RequestBody ForgotPasswordDto passwordDto) {

        boolean result = securityService.validatePasswordResetToken(passwordDto.getToken());

        // if true token is valid
        if(!result) {
            return "Neplatný ověřovací odkaz.";
        }

        Optional<User> user = userService.getUserByPasswordResetToken(passwordDto.getToken());
        if(user.isPresent()) {
            userService.changeUserPassword(user.get(), passwordDto.getNewPassword());
            passwordResetTokenRepository.deleteByToken(passwordDto.getToken());
            return "Heslo bylo změněno úspěšně";
        } else {
            return "Došlo k chybě při změně hesla";
        }
    }

    private boolean isTokenFound(ConfirmationToken passToken) {
        return passToken != null;
    }

    private boolean isTokenExpired(ConfirmationToken passToken) {
        final Calendar cal = Calendar.getInstance();
        return passToken.getExpiresAt().isBefore(LocalDateTime.now());
    }

    public void changeUserPassword(User user, String password) {
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
    }

    private SimpleMailMessage constructResetTokenEmail(
            String contextPath, Locale locale, String token, User user) {
        String url = contextPath + "/user/changePassword?token=" + token;
        String message = "Změna hesla:";
        return constructEmail("Reset Password", message + " \r\n" + url, user);
    }

    private SimpleMailMessage constructEmail(String subject, String body,
                                             User user) {
        SimpleMailMessage email = new SimpleMailMessage();
        email.setSubject(subject);
        email.setText(body);
        email.setTo(user.getUsername());
        email.setFrom("support");
        return email;
    }
}
