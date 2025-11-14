# SmartExam - School Exam Software Backend

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Architecture & Design](#architecture--design)
- [Apps Structure](#apps-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Setup Instructions](#setup-instructions)
- [Usage Flow](#usage-flow)
- [Optimization Strategies](#optimization-strategies)

---

## 🎯 Project Overview

SmartExam is a comprehensive Django-based exam management system designed for educational institutions. It supports three distinct exam modes:

1. **Quiz App** - Public quizzes without authentication
2. **Secondary School** - Student ID-based authentication for secondary students
3. **Tertiary/University** - Student ID-based authentication for tertiary students

### Key Features
- ✅ No login required for quiz app
- ✅ Student ID-only authentication for secondary/tertiary
- ✅ Real-time exam taking with concurrent user support
- ✅ Backend result calculation
- ✅ Module-based exam organization
- ✅ Profile validation and verification
- ✅ Scalable and optimized database queries

---

## 🏗️ Architecture & Design

### Project Structure
```
exam_backend/
├── apps/
│   ├── core/          # Shared models and utilities
│   ├── quiz/          # Public quiz functionality
│   ├── secondary/     # Secondary school exams
│   └── tertiary/      # Tertiary/university exams
├── backend/
│   ├── settings/      # Split settings (base, dev, prod)
│   ├── urls.py        # Main URL routing
│   └── wsgi.py        # WSGI application
├── utils/             # Helper functions and middleware
├── media/             # User uploaded files
└── staticfiles/       # Static files (CSS, JS, images)
```

### Technology Stack
- **Framework**: Django 5.2.7
- **API**: Django REST Framework 3.15.2
- **Authentication**: JWT (Simple JWT 5.3.1)
- **Database**: SQLite (development) / PostgreSQL (production ready)
- **Documentation**: drf-yasg (Swagger/OpenAPI)
- **Caching**: Django Redis (optional)
- **Task Queue**: Celery (optional for async tasks)

---

## 📱 Apps Structure

### 1. Core App
**Purpose**: Shared models and base functionality for all apps

**Models**:
- `BaseModel` - Abstract model with common fields (created_at, updated_at, is_active)
- `Subject` - Academic subjects (Math, English, Science, etc.)
- `Module` - Exam modules/topics within subjects
- `Question` - Question bank with options and correct answers
- `QuestionOption` - Multiple choice options for questions

**Key Features**:
- Reusable across all apps
- Centralized question management
- Support for different question types (MCQ, True/False)

---

### 2. Quiz App
**Purpose**: Public quizzes without authentication

**Models**:
- `QuizParticipant` - Stores participant name and session info
- `QuizSession` - Tracks active quiz sessions
- `QuizResult` - Stores quiz results

**Flow**:
1. Student enters name (no registration needed)
2. Selects available module from list
3. System loads questions for selected module
4. Student answers questions
5. System calculates score and returns result immediately
6. Result stored with participant name for records

**API Endpoints**:
```
POST   /api/quiz/start/                    # Start quiz with name
GET    /api/quiz/modules/                  # List available modules
GET    /api/quiz/questions/<module_id>/    # Get questions for module
POST   /api/quiz/submit/                   # Submit answers and get result
GET    /api/quiz/result/<session_id>/      # Retrieve result by session
```

---

### 3. Secondary App
**Purpose**: Secondary school student exams with authentication

**Models**:
- `SecondaryStudent` - Student profile with student_id
- `SecondaryExam` - Exam configurations for secondary students
- `SecondaryExamAttempt` - Tracks exam attempts
- `SecondaryResult` - Stores exam results with detailed scoring

**Flow**:
1. Student logs in with `student_id` only
2. System validates student profile
3. Dashboard shows all available exam modules
4. Student selects module and starts exam
5. Questions are loaded from core Question model
6. Student submits answers
7. Backend calculates result and stores in database
8. Result displayed to student with score breakdown

**API Endpoints**:
```
POST   /api/secondary/login/                      # Login with student_id
GET    /api/secondary/profile/                    # Get student profile
GET    /api/secondary/dashboard/                  # List available exams
GET    /api/secondary/exam/<exam_id>/             # Get exam details
POST   /api/secondary/exam/<exam_id>/start/       # Start exam attempt
GET    /api/secondary/exam/<exam_id>/questions/   # Get exam questions
POST   /api/secondary/exam/submit/                # Submit answers
GET    /api/secondary/results/                    # Student's exam history
GET    /api/secondary/results/<result_id>/        # Detailed result view
```

---

### 4. Tertiary App
**Purpose**: University/college student exams with authentication

**Models**:
- `TertiaryStudent` - Student profile with student_id and additional fields
- `TertiaryExam` - Exam configurations for tertiary students
- `TertiaryExamAttempt` - Tracks exam attempts
- `TertiaryResult` - Stores exam results with grading

**Flow**:
- Same as secondary app but with tertiary-specific fields
- May include additional features like:
  - Department/Faculty filtering
  - Semester-based exams
  - Credit unit tracking
  - GPA calculations

**API Endpoints**:
```
POST   /api/tertiary/login/                      # Login with student_id
GET    /api/tertiary/profile/                    # Get student profile
GET    /api/tertiary/dashboard/                  # List available exams
GET    /api/tertiary/exam/<exam_id>/             # Get exam details
POST   /api/tertiary/exam/<exam_id>/start/       # Start exam attempt
GET    /api/tertiary/exam/<exam_id>/questions/   # Get exam questions
POST   /api/tertiary/exam/submit/                # Submit answers
GET    /api/tertiary/results/                    # Student's exam history
GET    /api/tertiary/results/<result_id>/        # Detailed result view
```

---

## 🗄️ Database Schema

### Core Models Relationships

```
Subject (1) ─────> (N) Module
   │
   └──────> (N) Question
                    │
                    └──> (N) QuestionOption

Module (1) ────> (N) Question
```

### Quiz App Relationships

```
QuizParticipant (1) ────> (N) QuizSession
                               │
                               └──> (1) QuizResult
```

### Secondary/Tertiary Relationships

```
SecondaryStudent (1) ────> (N) SecondaryExamAttempt
                                      │
                                      └──> (1) SecondaryResult

SecondaryExam (1) ────> (N) SecondaryExamAttempt
Module (1) ────> (1) SecondaryExam
```

---

## 🚀 API Endpoints Summary

### Authentication
```
POST   /api/auth/token/          # JWT token obtain (for admin)
POST   /api/auth/token/refresh/  # JWT token refresh
```

### Quiz (No Auth Required)
```
POST   /api/quiz/start/
GET    /api/quiz/modules/
GET    /api/quiz/questions/<module_id>/
POST   /api/quiz/submit/
GET    /api/quiz/result/<session_id>/
```

### Secondary (Student ID Auth)
```
POST   /api/secondary/login/
GET    /api/secondary/profile/
GET    /api/secondary/dashboard/
POST   /api/secondary/exam/<exam_id>/start/
GET    /api/secondary/exam/<exam_id>/questions/
POST   /api/secondary/exam/submit/
GET    /api/secondary/results/
```

### Tertiary (Student ID Auth)
```
POST   /api/tertiary/login/
GET    /api/tertiary/profile/
GET    /api/tertiary/dashboard/
POST   /api/tertiary/exam/<exam_id>/start/
GET    /api/tertiary/exam/<exam_id>/questions/
POST   /api/tertiary/exam/submit/
GET    /api/tertiary/results/
```

### Admin
```
GET    /admin/                   # Django admin panel
GET    /api/docs/                # Swagger documentation
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.12+
- pip
- Virtual environment (recommended)

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd exam_backend
```

2. **Create virtual environment**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
# Create .env file in project root
cp .env.example .env

# Edit .env with your settings
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
```

5. **Run migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Create superuser**
```bash
python manage.py createsuperuser
```

7. **Load initial data (optional)**
```bash
python manage.py loaddata fixtures/subjects.json
python manage.py loaddata fixtures/modules.json
```

8. **Run development server**
```bash
python manage.py runserver
```

9. **Access the application**
- Admin Panel: http://localhost:8000/admin/
- API Docs: http://localhost:8000/api/docs/
- API Root: http://localhost:8000/api/

---

## 📊 Usage Flow

### Quiz App Flow (No Login)
```
1. Student visits quiz page
2. Enters name
3. System creates QuizParticipant
4. Shows available modules
5. Student selects module
6. System creates QuizSession
7. Loads questions for module
8. Student answers questions
9. Submits answers
10. Backend calculates score
11. Creates QuizResult
12. Returns result immediately
```

### Secondary/Tertiary Flow (With Login)
```
1. Student enters student_id
2. System validates student exists
3. Creates JWT token
4. Returns token + student profile
5. Student sees dashboard
6. Dashboard shows all available exams
7. Student selects exam
8. System creates ExamAttempt
9. Loads questions for exam module
10. Student answers questions
11. Submits answers
12. Backend calculates score
13. Creates Result record
14. Updates ExamAttempt status
15. Returns detailed result
```

---

## ⚡ Optimization Strategies

### Database Optimizations

1. **Indexing**
   - Index on `student_id` fields for fast lookups
   - Index on `module_id` for quick question filtering
   - Composite index on `(student, exam, created_at)` for result queries

2. **Query Optimization**
   - Use `select_related()` for foreign key lookups
   - Use `prefetch_related()` for reverse foreign key queries
   - Implement queryset caching for frequently accessed data

3. **Pagination**
   - Default pagination set to 21 items per page
   - Reduces data transfer and improves response time

### Concurrent User Support

1. **Database Connection Pooling**
   - Configure connection pool for production
   - Use persistent connections

2. **Session Management**
   - Use database-backed sessions for scalability
   - Implement session cleanup for expired quiz sessions

3. **Caching Strategy**
   - Cache module lists (rarely change)
   - Cache question lists per module
   - Invalidate cache on question updates

### Code Optimizations

1. **Lazy Loading**
   - Only load questions when exam starts
   - Defer non-critical fields

2. **Bulk Operations**
   - Use `bulk_create()` for creating multiple objects
   - Use `update()` instead of `save()` for updates

3. **Async Processing (Future Enhancement)**
   - Use Celery for result calculations
   - Email notifications for result availability

### Security Optimizations

1. **Rate Limiting**
   - Prevent brute force login attempts
   - Limit exam submission frequency

2. **Input Validation**
   - Validate all user inputs
   - Sanitize student names in quiz app

3. **JWT Security**
   - Short token lifetime (configurable)
   - Refresh token rotation
   - Token blacklisting on logout

---

## 🔐 Security Considerations

1. **Authentication**
   - Student ID should be unique and validated
   - Consider adding PIN/password for enhanced security
   - Implement account lockout after failed attempts

2. **Authorization**
   - Students can only access their own results
   - Exam questions only visible during active attempt
   - Admin-only access for exam creation/editing

3. **Data Protection**
   - Store sensitive data encrypted
   - Use HTTPS in production
   - Implement CORS properly

---

## 🧪 Testing Strategy

1. **Unit Tests**
   - Model validation tests
   - Serializer tests
   - View logic tests

2. **Integration Tests**
   - API endpoint tests
   - Authentication flow tests
   - Result calculation tests

3. **Performance Tests**
   - Load testing with multiple concurrent users
   - Database query optimization tests

---

## 🚀 Deployment Checklist

- [ ] Set `DEBUG=False`
- [ ] Configure production database (PostgreSQL)
- [ ] Set up static file serving (Nginx/Whitenoise)
- [ ] Configure media file storage (S3/Cloud Storage)
- [ ] Set up Redis for caching
- [ ] Configure Celery for async tasks
- [ ] Set up monitoring (Sentry)
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up automated backups
- [ ] Configure logging
- [ ] Run security audit

---

## 📈 Future Enhancements

1. **Primary School Support**
   - Add primary app with simplified interface
   - Picture-based questions for younger students

2. **Advanced Features**
   - Essay-type questions with manual grading
   - Timed exams with countdown
   - Exam scheduling and auto-activation
   - Real-time proctoring integration
   - Analytics dashboard for teachers
   - Bulk student import via CSV
   - Email notifications
   - Certificate generation

3. **Mobile App**
   - React Native mobile application
   - Offline exam capability
   - Push notifications

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👥 Support

For questions or support:
- Create an issue on GitHub
- Email: support@smartexam.com
- Documentation: https://docs.smartexam.com

---

**Last Updated**: November 13, 2025
**Version**: 1.0.0
