package com.ems.service;

import com.ems.exception.DuplicateEmailException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.model.Employee;
import com.ems.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository repository;

    public EmployeeService(EmployeeRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Employee> getAll(String query) {
        if (query == null || query.trim().isEmpty()) {
            return repository.findAllByOrderByIdDesc();
        }
        return repository.search(query.trim());
    }

    @Transactional(readOnly = true)
    public Employee getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id " + id));
    }

    public Employee create(Employee employee) {
        if (repository.existsByEmailIgnoreCase(employee.getEmail())) {
            throw new DuplicateEmailException("Email already exists");
        }
        employee.setId(null);
        return repository.save(employee);
    }

    public Employee update(Long id, Employee data) {
        Employee existing = getById(id);
        if (repository.existsByEmailIgnoreCaseAndIdNot(data.getEmail(), id)) {
            throw new DuplicateEmailException("Email already exists");
        }
        existing.setFirstName(data.getFirstName());
        existing.setLastName(data.getLastName());
        existing.setEmail(data.getEmail());
        existing.setPhone(data.getPhone());
        existing.setDepartment(data.getDepartment());
        existing.setDesignation(data.getDesignation());
        existing.setSalary(data.getSalary());
        existing.setDateOfJoining(data.getDateOfJoining());
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.delete(getById(id));
    }
}
