package com.ems.repository;

import com.ems.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    @Query("SELECT e FROM Employee e WHERE " +
           "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(e.department) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(e.designation) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "ORDER BY e.id DESC")
    List<Employee> search(@Param("q") String q);

    List<Employee> findAllByOrderByIdDesc();
}
