INSERT INTO department (name)
VALUES ("Engineering"),
       ("Finance"),
       ("Legal"),
       ("Sales");


INSERT INTO role (title, salary,department_id)
VALUES ("Sales Lead", 100000,4),
       ("Account Manager", 160000,2),
       ("Legal Team Lead", 180000,3),
       ("Lead Engineer", 200000,1),
       ("Salesperson", 80000,4),
       ("Accountant", 125000,2),
       ("Lawyer", 150000,3),
       ("Software Engineer", 150000,1);

INSERT INTO employee (first_name,last_name,role_id,manager_id)
VALUES ("Rachel", "Green", 1, NULL),
       ("Mike", "Hannigan", 2, NULL),
       ("Monica", "Geller", 3, NULL),
       ("Ross", "Geller", 4, NULL),
       ("Joey", "Tribbiani", 5, 1),
       ("Phoebe", "Buffay", 6, 2),
       ("Janice", "Goralnik", 7, 3),
       ("Chandler", "Bing", 8, 4);
