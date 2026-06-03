# ExpenseTracker

A full-stack web application for managing and tracking personal expenses with category organization, user authentication, and visual analytics.

## Features

- **User Authentication** - Secure login and registration with OTP verification
- **Expense Management** - Create, read, update, and delete expenses
- **Category Organization** - Organize expenses by custom categories
- **Visual Analytics** - View expense charts and reports
- **User Dashboard** - Personalized dashboard with expense overview
- **Responsive Design** - Works seamlessly across devices

## Tech Stack

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Passport.js** - Authentication middleware
- **JWT** - Token-based authentication

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **CSS3** - Styling
- **Axios** - HTTP client

## Project Structure

```
ExpenseTracker/
├── backend/
│   ├── app/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database schemas
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── middlewares/     # Custom middleware
│   │   └── validation/      # Input validation
│   ├── config/              # Database & auth config
│   ├── uploads/             # File uploads
│   ├── server.js            # Main server file
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── pages/           # Page components
    │   ├── App.jsx          # Main app component
    │   ├── main.jsx         # Entry point
    │   └── assets/          # Static files
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with required environment variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with API configuration:
   ```
   VITE_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Expenses
- `GET /expenses` - Get all expenses
- `POST /expenses` - Create new expense
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense

### Categories
- `GET /categories` - Get all categories
- `POST /categories` - Create new category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile

## Usage

1. Register a new account with your email
2. Verify OTP sent to your email
3. Log in to your dashboard
4. Create expense categories
5. Add expenses with category, amount, and description
6. View expense analytics and reports
7. Manage your expenses

## Development

### Running Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues and questions, please open an issue on the GitHub repository.

---

**Built with ❤️ - ExpenseTracker**
