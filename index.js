const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

const employeeQuery = `
SELECT e.id, e.first_name, e.last_name, title, department.name AS department, salary, concat(m.first_name,' ',m.last_name) manager 
FROM employee e 
LEFT JOIN employee m 
ON e.manager_id = m.id
JOIN role 
JOIN department 
ON e.role_id = role.id 
AND department_id = department.id
ORDER BY e.id;
`

const departmentQuery = `
SELECT * FROM department
`

const roleQuery = `
SELECT role.id, role.title, department.name, role.salary 
FROM role 
JOIN department 
ON role.department_id = department.id
ORDER BY id;
`

const empNameQuery = `
SELECT id, concat(first_name, ' ',last_name) name 
FROM employee;
`

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'employeeManagement_db',
    password: 'password'
});

function manageTeam() {
    console.log("Weclome to the Employee Management System")
    inquirer.prompt([
        {
            name: "choices",
            message: 'What would you like to do?',
            type: "list",
            choices: ["View All Departments", "View All Roles", "View All Employees", "Add Department", "Add Role", "Add Employee", "Update Employee Role", "Quit"]
        }
    ]).then(answers => {
        switch (answers.choices) {
            case "View All Departments":
                console.log("Showing All Departments")
                connection.query(
                    departmentQuery,
                    function (err, results, fields) {
                        console.log()
                        console.table(results)
                    }
                );
                manageTeam()
                break;

            case "View All Roles":
                console.log("Showing All Roles")
                connection.query(
                    roleQuery,
                    function (err, results, fields) {
                        console.log()
                        console.table(results);
                    }
                );
                manageTeam()
                break;

            case "View All Employees":
                console.log("Showing All Employees")
                connection.query(
                    employeeQuery,
                    function (err, results, fields) {
                        console.log()
                        console.table(results);
                    }
                );
                manageTeam()
                break;

            case "Add Department":
                addDepartment();
                break;

            case "Add Role":
                addRole();
                break;

            case "Add Employee":
                addEmployee();
                break;

            case "Update Employee Role":
                selectEmployeeToUpdate();
                break;

            case "Quit":
                console.log("Bye")
                process.exit(1)
        }
    })
}

function addDepartment() {
    inquirer.prompt([
        {
            name: "name",
            message: "What is the name of the department?",
            type: "input"
        },
    ]).then(({ name }) => {
        let insertDepQuery = 'INSERT INTO department (name) VALUES (?)';
        connection.query(insertDepQuery, name, function(err, result, fields) {
            console.log('Department Added');
            manageTeam()
        })
    })
}

function addRole() {
    connection.query(
        departmentQuery,
        function (err, results, fields) {
            inquirer.prompt([
                {
                    name: "title",
                    message: "What is the title of the role?",
                    type: "input"
                },
                {
                    name: "salary",
                    message: "What is the salary of the role?",
                    type: "input"
                },
                {
                    name: "department_id",
                    message: "Which department does this role belong to?",
                    type: "list",
                    choices: results.map(result => {
                        return {
                            value: result.id,
                            name: result.name
                        }
                    })
                },
            ]).then((answers) => {
                let insertRoleQuery = 'insert into role(title, salary, department_id) values(?,?,?)';
                let insertData = [answers.title, answers.salary, answers.department_id];
                connection.query(insertRoleQuery, 
                    insertData,
                    function (err, result, fields) {
                        if (err) {
                            console.log(err);
                        } else {
                        console.log('Role Added');
                        manageTeam()
                    }
                })
            })
        }
    );
}

function addEmployee() {
    connection.query(
        roleQuery,
        function (err, roleResults, fields) {
            // console.log(roleResults);
            connection.query(
                empNameQuery,
                function (err, mgrResults, fields) {
                    // console.log(mgrResults);
                    let mgrList =
                        mgrResults.map(result => {
                            return {
                                value: result.id,
                                name: result.name
                            }
                        });

                    mgrList.unshift({
                        value: null,
                        name: 'None'
                    })

                    inquirer.prompt([
                        {
                            name: "first_name",
                            message: "What is the employee's first name?",
                            type: "input"
                        },
                        {
                            name: "last_name",
                            message: "What is the employee's last name?",
                            type: "input"
                        },

                        {
                            name: "role_id",
                            message: "What is the employee's role?",
                            type: "list",
                            choices: roleResults.map(result => {
                                return {
                                    value: result.id,
                                    name: result.title
                                }
                            })
                        },
                        {
                            name: "manager_id",
                            message: "Who is the employee's manager?",
                            type: "list",
                            choices: mgrList,
                        },
                    ]).then((answers) => {
                        console.log(answers);
                        let insertEmpQuery = 'INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES (?,?,?,?)';
                        let insertData = [answers.first_name, answers.last_name, answers.role_id, answers.manager_id];
                        if (!answers.manager_id) {
                            insertEmpQuery = 'INSERT INTO employee (first_name,last_name,role_id) VALUES (?,?,?)';
                            insertData = [answers.first_name, answers.last_name, answers.role_id];
                        }
                        connection.query(insertEmpQuery,
                            insertData,
                            function (err, insertEmpResult, fields) {
                                if (err) {
                                    console.log(err);
                                }
                                console.log("Employee Added")
                                // console.log(insertEmpResult)
                                manageTeam()
                            });
                    })
                }
            );
        }
    );
}

function selectEmployeeToUpdate() {
    connection.query(
        'SELECT * FROM `employee`',
        function (err, results, fields) {
            // console.log(results); 
            inquirer.prompt([
                {
                    name: "employee_id",
                    message: "Which employee's role do you want to update?",
                    type: "list",
                    choices: results.map(result => {
                        return {
                            value: result.id,
                            name: result.first_name + ' ' + result.last_name
                        }
                    })
                },
            ]).then((answers) => {
                // console.log(answers)
                updateEmployee(answers.employee_id)
            })
        }
    );
}

function updateEmployee(employee_id) {
    // employee_id
    connection.query(
        'SELECT * FROM `role`',
        function (err, results, fields) {
            // console.log(results); 
            inquirer.prompt([
                {
                    name: "role_id",
                    message: "Which role do you want to assign the selected employee?",
                    type: "list",
                    choices: results.map(result => {
                        return {
                            value: result.id,
                            name: result.title
                        }
                    }),
                }]
            ).then((answers) => {
                let updateEmpQuery = 'UPDATE employee SET role_id = ? WHERE id = ?';
                let updateData = [answers.role_id, employee_id];
                connection.query(updateEmpQuery, 
                updateData, function(err, results, fields) {
                    if (err) {
                        console.log(err);
                    }
                    console.log("Employee Updated")
                    // console.log(insertEmpResult)
                    manageTeam()
                })
            })
        }
    );
}

manageTeam()

// update employee managers;
// view employees by manager
// view employee by department
// delete departments, roles, and employees
// view the total utilized budget of a department - in other words, the combined salaries of all employees in that department
