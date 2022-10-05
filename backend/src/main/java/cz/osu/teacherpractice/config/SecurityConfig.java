package cz.osu.teacherpractice.config;

import com.auth0.jwt.algorithms.Algorithm;
import cz.osu.teacherpractice.filter.CustomAuthenticationFilter;
import cz.osu.teacherpractice.filter.CustomAuthorizationFilter;
import cz.osu.teacherpractice.model.Role;
import cz.osu.teacherpractice.repository.UserRepository;
import cz.osu.teacherpractice.service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import static cz.osu.teacherpractice.config.AppConfig.baseUrlDevelopment;
import static cz.osu.teacherpractice.config.AppConfig.baseUrlProduction;
import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    // should be stored on a more secure place
    public static final String JWT_SECRET_KEY = "secret-key";
    public static final int JWT_TOKEN_EXPIRATION_DAYS = 14;

    // cookie containing jwt token
    public static final String COOKIE_NAME = "access_token";
    public static final boolean COOKIE_HTTP_ONLY = false;
    public static final boolean COOKIE_SECURE = false;
    public static final int COOKIE_EXPIRATION_SECONDS = JWT_TOKEN_EXPIRATION_DAYS * 24 * 60 * 60;

    private final UserDetailsServiceImpl userDetailsService;
    private final UserRepository userRepository;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        //http.cors();
        http.csrf().disable();
        //http.authorizeRequests();
        http.sessionManagement().sessionCreationPolicy(STATELESS);
        http.authorizeRequests().antMatchers("/login/**", "/register/**", "/forgotPassword/**", "/healthCheck/**").permitAll();
        http.authorizeRequests().antMatchers("/student/**").hasAnyAuthority(Role.STUDENT.getCode(), Role.COORDINATOR.getCode());
        http.authorizeRequests().antMatchers("/teacher/**").hasAuthority(Role.TEACHER.getCode());
        http.authorizeRequests().antMatchers("/coordinator/**").hasAuthority(Role.COORDINATOR.getCode());
        http.authorizeRequests().antMatchers("/upload", "/report/upload").hasAuthority(Role.TEACHER.getCode());
        http.authorizeRequests().antMatchers("/teacher/upload").hasAuthority(Role.TEACHER.getCode());
        http.authorizeRequests().anyRequest().authenticated();

        http.addFilter(new CustomAuthenticationFilter(authenticationManagerBean(), jwtAlgorithm(), userRepository));
        http.addFilterBefore(new CustomAuthorizationFilter(userDetailsService, jwtAlgorithm()), UsernamePasswordAuthenticationFilter.class);
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public Algorithm jwtAlgorithm() {
        return Algorithm.HMAC256(JWT_SECRET_KEY);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        final CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(baseUrlDevelopment, baseUrlProduction));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization"));
        final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
