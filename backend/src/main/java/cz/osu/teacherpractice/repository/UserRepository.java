package cz.osu.teacherpractice.repository;

import cz.osu.teacherpractice.model.Practice;
import cz.osu.teacherpractice.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u WHERE u.username = ?1")
    Optional<User> findByEmail(String username);

    @Transactional
    @Modifying
    @Query("UPDATE User a SET a.enabled = True WHERE a.username = ?1")
    int enableAppUser(String email);

    @Transactional
    @Modifying
    @Query("DELETE FROM User WHERE username = :username")
    int deleteUserByEmail(@Param("username") String username);

    @Transactional
    @Modifying
    @Query("UPDATE User a SET a.locked = False WHERE a.username = :username")
    int unlockAppUser(@Param("username") String username);

    @Query("SELECT u FROM User u WHERE u.locked = True")
    List<User> getAllLocked();

    String deleteByUsername(String Username);

//    @Transactional
//    @Query("SELECT u.firstName, u.secondName, u.username, u.phoneNumber, u.role FROM User u WHERE u.locked=True")
//    List<User> getAllLocked();
}
