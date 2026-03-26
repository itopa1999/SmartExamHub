# SmartExam - Create Exam Testing Guide

## ✅ Backend Setup Complete

### Services Running:
- ✅ Django Server: http://127.0.0.1:8000/
- ✅ Virtual Environment: Activated with all dependencies
- ✅ Sample Excel File: `exam_backend/exam_question_template.xlsx`

---

## 📋 Pre-Testing Checklist

### 1. Backend Requirements
- [x] Django server running on port 8000
- [x] Virtual environment activated
- [x] Dependencies installed (pandas, openpyxl, xlrd)
- [x] CORS configured for http://127.0.0.1:5501
- [x] Database migrations applied

### 2. Frontend Requirements
- [ ] Live Server running on port 5501
- [ ] Admin user logged in with valid JWT token
- [ ] Browser console open for debugging

---

## 🚀 Testing Steps

### Step 1: Start Frontend Server
```bash
# Open exam_frontend folder in VS Code
# Right-click on index.html
# Select "Open with Live Server"
# Should open at: http://127.0.0.1:5501/
```

### Step 2: Login as Admin
1. Navigate to: `http://127.0.0.1:5501/exam_frontend/core/auth.html`
2. Enter your admin credentials
3. Click "Login"
4. Should redirect to admin dashboard

### Step 3: Navigate to Create Exam Page
1. From dashboard, click "Create Exam" or go to:
   `http://127.0.0.1:5501/exam_frontend/core/create-exam.html`
2. Page should load with upload area visible

### Step 4: Fill Exam Details
1. **Upload File**: 
   - Click "Browse Files" or drag & drop
   - Select: `exam_backend/exam_question_template.xlsx`
   - File info should display

2. **Fill Required Fields**:
   - **Exam Title**: "Sample Mathematics Test"
   - **Exam Code**: "MATH101"
   - **Academic Level**: Select from dropdown (e.g., "Grade 10")
   - **Description**: "Basic algebra and geometry questions" (optional)

3. **Configure Settings**:
   - **Duration**: 60 minutes (default)
   - **Passing Score**: 60% (default)
   - **Max Attempts**: 1 (default)
   - **Checkboxes**: 
     - ✅ Randomize question order
     - ✅ Show correct answers after completion
     - ⬜ Activate exam immediately (optional)

### Step 5: Preview Questions
1. Click "Preview Questions" button
2. Wait for file parsing (2-3 seconds)
3. Should see table with 5 sample questions:
   - Question text
   - Options preview
   - Correct answer
   - Difficulty level
   - Category

### Step 6: Submit Exam
1. Review preview table
2. Click "Confirm & Create Exam" button
3. Watch for:
   - Progress bar animation
   - Success message: "Exam created successfully with 5 questions!"
   - Form reset after 3 seconds

---

## 🔍 What to Check

### Backend Console Output
Watch the terminal running Django server for:
```
[DEBUG] Starting exam creation: Sample Mathematics Test
[DEBUG] Parsing file: exam_question_template.xlsx
[DEBUG] Excel file loaded, shape: (5, 11)
[DEBUG] Original columns: [...]
[DEBUG] Normalized columns: [...]
[DEBUG] Extracted 5 rows from file
[DEBUG] Successfully parsed 5 questions
[DEBUG] Validated 5 valid questions
[DEBUG] Created exam module: MATH101
[DEBUG] Created 5 questions
```

### Browser Network Tab
Check the following API calls:
1. **GET** `/core/api/admin/levels/` → Status 200, returns level list
2. **POST** `/core/api/admin/exams/create/` → Status 200, returns exam data

### Expected API Response (Success)
```json
{
  "success": true,
  "message": "Exam 'Sample Mathematics Test' created successfully with 5 questions",
  "data": {
    "exam_module": {
      "id": 1,
      "title": "Sample Mathematics Test",
      "code": "MATH101",
      "total_questions": 5,
      "total_marks": 10
    },
    "questions": [
      {
        "id": 1,
        "question_text": "What is 2 + 2?",
        "difficulty": "easy",
        "category": "Basic Arithmetic",
        "marks": 2
      },
      // ... more questions
    ],
    "bulk_upload": {
      "id": 1,
      "total_records": 5,
      "successful_records": 5,
      "failed_records": 0,
      "status": "completed"
    }
  }
}
```

---

## ❌ Common Issues & Solutions

### Issue 1: "No levels found" or dropdown is empty
**Cause**: No Level records in database
**Solution**:
```bash
cd exam_backend
venv\Scripts\python.exe manage.py shell
```
```python
from apps.core.models import Level
Level.objects.create(name="Grade 10", level_type="secondary", code="SEC10", is_active=True)
Level.objects.create(name="Grade 11", level_type="secondary", code="SEC11", is_active=True)
exit()
```

### Issue 2: CORS Error (Network request blocked)
**Cause**: Frontend port doesn't match CORS settings
**Solution**: 
1. Check your Live Server port (should be 5501)
2. Update `exam_backend/backend/settings/dev.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:5501",  # Add your port here
    "http://localhost:5501",
]
```
3. Restart Django server

### Issue 3: "401 Unauthorized" errors
**Cause**: JWT token expired or missing
**Solution**: 
1. Logout from admin panel
2. Login again to get fresh tokens
3. Try upload again

### Issue 4: File parsing error
**Cause**: Excel file format incorrect
**Solution**:
1. Use the generated template: `exam_question_template.xlsx`
2. Ensure required columns exist:
   - question_text
   - option_a, option_b, option_c, option_d
   - correct_answer (A, B, C, or D)

### Issue 5: "pandas module not found"
**Cause**: Virtual environment not activated
**Solution**:
```bash
cd exam_backend
# Stop server (Ctrl+C)
venv\Scripts\python.exe manage.py runserver
```

### Issue 6: Preview shows "No questions to display"
**Cause**: SheetJS library not loaded or parsing error
**Solution**:
1. Check browser console for errors
2. Ensure internet connection (CDN for SheetJS)
3. Try with CSV file instead of Excel

---

## 🧪 Advanced Testing

### Test CSV Upload
1. Create `test_questions.csv`:
```csv
question_text,option_a,option_b,option_c,option_d,correct_answer,difficulty,category,marks
What is 5 x 5?,20,25,30,35,B,easy,Mathematics,2
What is the capital of France?,London,Berlin,Paris,Rome,C,medium,Geography,2
```
2. Upload and verify parsing

### Test Edit Exam (Update Mode)
```javascript
// Browser console
const formData = new FormData();
formData.append('title', 'Updated Exam Title');
formData.append('mode', 'update');  // Keep existing + add new

fetch('http://127.0.0.1:8000/core/api/admin/exams/1/', {
    method: 'PUT',
    headers: {
        'Authorization': 'Bearer ' + CookieManager.get('access_token')
    },
    body: formData
}).then(r => r.json()).then(console.log);
```

### Test Edit Exam (Replace Mode)
```javascript
// With file upload - replaces all questions
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('mode', 'replace');  // Delete all + add new

fetch('http://127.0.0.1:8000/core/api/admin/exams/1/', {
    method: 'PUT',
    headers: {
        'Authorization': 'Bearer ' + CookieManager.get('access_token')
    },
    body: formData
}).then(r => r.json()).then(console.log);
```

---

## 📊 Database Verification

After successful upload, verify in Django admin or shell:

```bash
cd exam_backend
venv\Scripts\python.exe manage.py shell
```

```python
from apps.core.models import ExamModule, Question, BulkUpload

# Check exam created
exam = ExamModule.objects.last()
print(f"Exam: {exam.title} ({exam.code})")
print(f"Questions: {exam.total_questions}")
print(f"Total Marks: {exam.total_marks}")

# Check questions
questions = Question.objects.filter(exam_module=exam)
for q in questions:
    print(f"Q{q.order}: {q.question_text[:50]}... (Answer: {q.correct_answer})")

# Check upload record
upload = BulkUpload.objects.last()
print(f"Upload Status: {upload.status}")
print(f"Success Rate: {upload.success_rate}%")
```

---

## ✨ Success Criteria

- [x] Backend server running without errors
- [ ] Frontend loads without console errors
- [ ] Levels dropdown populates
- [ ] Excel file preview shows questions
- [ ] CSV file preview shows questions
- [ ] Form validation works (required fields)
- [ ] Upload progress bar animates
- [ ] Success message displays
- [ ] Questions saved to database
- [ ] BulkUpload record created
- [ ] No CORS errors in console
- [ ] Backend logs show debug output

---

## 📝 Next Steps After Testing

1. **Create Edit Exam Frontend**:
   - Create `edit-exam.html` page
   - Load existing exam data
   - Allow file upload to add/replace questions

2. **Add Validation Improvements**:
   - Check for duplicate exam codes
   - Validate question data before preview
   - Show error details for failed questions

3. **Enhance UI/UX**:
   - Add loading skeletons
   - Show upload progress percentage
   - Add question editing in preview table
   - Implement drag-drop question reordering

4. **Production Deployment**:
   - Update CORS settings for production domain
   - Use production-grade file storage (S3, etc.)
   - Add rate limiting for uploads
   - Implement file scanning for security

---

## 🆘 Need Help?

If you encounter issues not listed here:

1. **Check Django Terminal**: Look for debug output and tracebacks
2. **Check Browser Console**: Look for JavaScript errors or network issues
3. **Check Network Tab**: Verify API request/response details
4. **Test API with Postman**: Isolate frontend vs backend issues

---

**Testing Status**: ✅ Backend Ready | ⏳ Frontend Testing Needed

Last Updated: November 17, 2025
