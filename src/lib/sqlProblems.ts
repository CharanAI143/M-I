import type { SqlDifficulty, SqlProblem } from '@/lib/types'

export const SQL_TOPICS = [
  'All Topics',
  'SELECT',
  'WHERE & Filters',
  'Aggregation',
  'JOINs',
  'GROUP BY & HAVING',
  'Subqueries',
  'Window Functions',
]

export const SQL_DURATIONS = [15, 30, 45, 60]
export const SQL_COUNTS = [3, 5, 10]

// Shared employee/department schema used by most problems.
export const COMPANY_SCHEMA = `
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO departments VALUES (1, 'Engineering');
INSERT INTO departments VALUES (2, 'Sales');
INSERT INTO departments VALUES (3, 'Marketing');
INSERT INTO departments VALUES (4, 'HR');

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department_id INTEGER,
  salary INTEGER,
  manager_id INTEGER
);
INSERT INTO employees VALUES (1, 'Alice', 1, 120000, NULL);
INSERT INTO employees VALUES (2, 'Bob', 1, 95000, 1);
INSERT INTO employees VALUES (3, 'Carol', 1, 110000, 1);
INSERT INTO employees VALUES (4, 'Dave', 2, 82000, NULL);
INSERT INTO employees VALUES (5, 'Eve', 2, 76000, 4);
INSERT INTO employees VALUES (6, 'Frank', 2, 88000, 4);
INSERT INTO employees VALUES (7, 'Grace', 3, 68000, NULL);
INSERT INTO employees VALUES (8, 'Heidi', 3, 65000, 7);
INSERT INTO employees VALUES (9, 'Ivan', 4, 58000, NULL);
INSERT INTO employees VALUES (10, 'Judy', 4, 61000, 9);
INSERT INTO employees VALUES (11, 'Jack', 2, 91000, 4);
INSERT INTO employees VALUES (12, 'Kate', 1, 70000, 1);
`

const P = (
  id: string,
  title: string,
  topic: string,
  difficulty: SqlDifficulty,
  description: string,
  hint: string,
  solution: string,
  starterCode?: string
): SqlProblem => ({
  id,
  title,
  topic,
  difficulty,
  description,
  hint,
  schema: COMPANY_SCHEMA,
  solution,
  starterCode,
})

export const DEFAULT_SQL_PROBLEMS: SqlProblem[] = [
  // ── Easy ────────────────────────────────────────────────────────
  P(
    'select-all-employees',
    'All employees, richest first',
    'SELECT',
    'Easy',
    'List every employee together with their salary, ordered from the highest salary to the lowest.',
    'SELECT the name and salary columns, then ORDER BY salary in descending order.',
    'SELECT name, salary FROM employees ORDER BY salary DESC;',
    'SELECT name, salary\nFROM employees\nORDER BY salary DESC;'
  ),
  P(
    'salary-above',
    'Well-paid employees',
    'WHERE & Filters',
    'Easy',
    'Show the names of all employees earning more than 80,000.',
    'Filter with WHERE salary > 80000.',
    "SELECT name FROM employees WHERE salary > 80000;",
    'SELECT name\nFROM employees\nWHERE salary > 80000;'
  ),
  P(
    'names-starting',
    'Names starting with J',
    'WHERE & Filters',
    'Easy',
    'Return the employees whose name starts with the letter "J".',
    'LIKE with a "J%" pattern.',
    "SELECT name FROM employees WHERE name LIKE 'J%';",
    "SELECT name\nFROM employees\nWHERE name LIKE 'J%';"
  ),
  P(
    'count-employees',
    'How many employees?',
    'Aggregation',
    'Easy',
    'Count the total number of employees in the company.',
    'Use COUNT(*) and give the column an alias like employee_count.',
    'SELECT COUNT(*) AS employee_count FROM employees;',
    'SELECT COUNT(*) AS employee_count\nFROM employees;'
  ),
  P(
    'top-three-earners',
    'Top 3 earners',
    'SELECT',
    'Easy',
    'Return the names and salaries of the three highest-paid employees.',
    'ORDER BY salary DESC and cap the results with LIMIT 3.',
    'SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3;',
    'SELECT name, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 3;'
  ),
  P(
    'average-salary',
    'Average salary',
    'Aggregation',
    'Easy',
    'Compute the average salary across the whole company, rounded to the nearest dollar.',
    'AVG(salary) wrapped in ROUND(..., 0).',
    'SELECT ROUND(AVG(salary), 0) AS average_salary FROM employees;',
    'SELECT ROUND(AVG(salary), 0) AS average_salary\nFROM employees;'
  ),

  // ── Medium ──────────────────────────────────────────────────────
  P(
    'join-departments',
    'Employee departments',
    'JOINs',
    'Medium',
    'List each employee alongside the name of their department, sorted by employee name.',
    'Join employees to departments on department_id, then ORDER BY employee name.',
    'SELECT e.name AS employee, d.name AS department FROM employees e JOIN departments d ON e.department_id = d.id ORDER BY e.name;',
    'SELECT e.name AS employee, d.name AS department\nFROM employees e\nJOIN departments d ON e.department_id = d.id\nORDER BY e.name;'
  ),
  P(
    'count-per-department',
    'Headcount per department',
    'GROUP BY & HAVING',
    'Medium',
    'Count how many employees work in each department. Show all departments, even those with zero employees.',
    'LEFT JOIN departments so every department appears, then GROUP BY with COUNT(*).',
    'SELECT d.name AS department, COUNT(e.id) AS employee_count FROM departments d LEFT JOIN employees e ON e.department_id = d.id GROUP BY d.id, d.name ORDER BY employee_count DESC;',
    'SELECT d.name AS department, COUNT(e.id) AS employee_count\nFROM departments d\nLEFT JOIN employees e ON e.department_id = d.id\nGROUP BY d.id, d.name\nORDER BY employee_count DESC;'
  ),
  P(
    'avg-salary-per-department',
    'Average salary by department',
    'JOINs',
    'Medium',
    'For each department, show its average salary rounded to the nearest dollar, highest average first.',
    'JOIN the two tables, AVG(e.salary) per department, and ROUND the result.',
    'SELECT d.name AS department, ROUND(AVG(e.salary), 0) AS average_salary FROM employees e JOIN departments d ON e.department_id = d.id GROUP BY d.id, d.name ORDER BY average_salary DESC;',
    'SELECT d.name AS department, ROUND(AVG(e.salary), 0) AS average_salary\nFROM employees e\nJOIN departments d ON e.department_id = d.id\nGROUP BY d.id, d.name\nORDER BY average_salary DESC;'
  ),
  P(
    'big-departments',
    'Departments with 3+ employees',
    'GROUP BY & HAVING',
    'Medium',
    'Find departments that employ more than 3 people, showing the department name and headcount.',
    'GROUP BY department then filter the groups with HAVING COUNT(*) > 3.',
    'SELECT d.name AS department, COUNT(*) AS employee_count FROM employees e JOIN departments d ON e.department_id = d.id GROUP BY d.id, d.name HAVING COUNT(*) > 3;',
    'SELECT d.name AS department, COUNT(*) AS employee_count\nFROM employees e\nJOIN departments d ON e.department_id = d.id\nGROUP BY d.id, d.name\nHAVING COUNT(*) > 3;'
  ),
  P(
    'second-highest-salary',
    'Second highest salary',
    'Subqueries',
    'Medium',
    'Return the second highest salary in the company.',
    'Take the MAX of all salaries that are below the overall MAX in a subquery.',
    'SELECT MAX(salary) AS second_highest_salary FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);',
    'SELECT MAX(salary) AS second_highest_salary\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);'
  ),

  // ── Hard ────────────────────────────────────────────────────────
  P(
    'earn-more-than-manager',
    'Out-earning the boss',
    'JOINs',
    'Hard',
    'Find employees who earn more than their own manager. Show the employee name and the manager name.',
    'Self-join employees to employees using manager_id. A LEFT JOIN would include people without a manager — match on id instead so a row must pair with its manager.',
    'SELECT e.name AS employee, m.name AS manager FROM employees e JOIN employees m ON e.manager_id = m.id WHERE e.salary > m.salary ORDER BY e.name;',
    'SELECT e.name AS employee, m.name AS manager\nFROM employees e\nJOIN employees m ON e.manager_id = m.id\nWHERE e.salary > m.salary\nORDER BY e.name;'
  ),
  P(
    'above-department-average',
    'Above department average',
    'Subqueries',
    'Hard',
    'List employees whose salary is higher than the average salary of their own department.',
    'Correlated subquery: compare each salary against AVG over employees in the same department.',
    'SELECT name, salary FROM employees e WHERE salary > (SELECT AVG(salary) FROM employees WHERE department_id = e.department_id) ORDER BY name;',
    'SELECT name, salary\nFROM employees e\nWHERE salary > (\n  SELECT AVG(salary)\n  FROM employees\n  WHERE department_id = e.department_id\n)\nORDER BY name;'
  ),
  P(
    'salary-rank-per-department',
    'Salary rank per department',
    'Window Functions',
    'Hard',
    'Rank each employee from highest to lowest salary within their department. Show name, salary, and the rank.',
    'RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) gives a fresh ranking per department.',
    'SELECT name, salary, RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS salary_rank FROM employees ORDER BY department_id, salary_rank;'
  ),
]

export function buildSqlProblems(
  bank: SqlProblem[],
  difficulty: SqlDifficulty | 'Mixed',
  topic: string,
  count: number
): SqlProblem[] {
  const byDifficulty = bank.filter((q) => difficulty === 'Mixed' || q.difficulty === difficulty)
  const byTopic = bank.filter((q) => topic === 'All Topics' || q.topic === topic)

  const pool: SqlProblem[] = []
  const priority = [
    byDifficulty.filter((q) => topic === 'All Topics' || q.topic === topic),
    byDifficulty,
    byTopic,
    bank,
  ]
  for (const list of priority) {
    for (const q of list) {
      if (!pool.some((p) => p.id === q.id)) pool.push(q)
    }
  }

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  return pool.slice(0, Math.max(1, count))
}