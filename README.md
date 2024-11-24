# SQL Injection Vulnerable Login Example

This project demonstrates a login system vulnerable to SQL injection attacks. It is intended for educational purposes only to illustrate the risks of improper input handling and the importance of secure coding practices.

## **Requirements**

To run this project, you need the following installed on your system:

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- SQLite3 (no need for separate installation; included in the project setup)

## **Setup**

Follow these steps to set up and run the project:

1. **Clone the Repository**:
   ```bash
   git clone <repository_url>
   cd <repository_name>
   ```

 2. **Install Dependencies: Install the required Node.js packages:**
    ```
    npm install
    ```
3. **Run the Server: Start the Node.js server:**
    ```
    node server.js
    ```
4. **Access the Application: Open your browser and go to:**
    ```
    http://localhost:3000
    ```
    You should see a login page with fields for a username and password.

## **Demonstrate SQL Injection**

Here’s how to demonstrate the SQL injection vulnerability:

1. Default Users: The database is prepopulated with the following users:

```
user1 (password: password1)
user2 (password: password2)
user3 (password: password3)
user4 (password: password4)
user5 (password: password5)
```

2. Attempt Normal Login: Enter a valid username (e.g., user1) and password (e.g., password1). This should log in successfully.

3. Exploit SQL Injection: Enter the following in the login form:

```
Username: user1' OR '1'='1
```
```
Password: Leave it empty or enter anything.
```

This manipulates the SQL query to always return true and bypasses authentication.

**Expected Behavior**:

- You will be logged in successfully without providing valid credentials.
- This happens because the query becomes:

```
SELECT * FROM users WHERE username = 'usrername1' OR '1'='1' AND password = ''
```

