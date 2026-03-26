"""
Quick Test Script - Verify Backend APIs
Tests the create exam functionality without frontend
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apps.core.models import Level, ExamModule, Question
from django.contrib.auth.models import User
from apps.core.BLL.Commands.create_exam import CreateExamCommand
from django.core.files.uploadedfile import SimpleUploadedFile
import os

print("=" * 70)
print("🧪 BACKEND API TEST - Create Exam Functionality")
print("=" * 70)

# Test 1: Check Levels
print("\n📋 Test 1: Checking Levels...")
levels = Level.objects.filter(is_active=True)
print(f"   ✅ Found {levels.count()} active levels")
for level in levels[:3]:
    print(f"      - {level.name} ({level.code})")

# Test 2: Check Admin User
print("\n👤 Test 2: Checking Admin User...")
try:
    admin_user = User.objects.filter(is_staff=True, is_superuser=True).first()
    if admin_user:
        print(f"   ✅ Admin user found: {admin_user.username}")
    else:
        print("   ⚠️  No admin user found. Creating one...")
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@smartexam.com',
            password='admin123',
            first_name='Admin',
            last_name='User'
        )
        print(f"   ✅ Created admin user: {admin_user.username} (password: admin123)")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 3: Check Sample Excel File
print("\n📄 Test 3: Checking Sample Excel File...")
excel_file_path = 'exam_question_template.xlsx'
if os.path.exists(excel_file_path):
    file_size = os.path.getsize(excel_file_path)
    print(f"   ✅ Sample file exists: {excel_file_path}")
    print(f"      Size: {file_size} bytes")
else:
    print(f"   ❌ Sample file not found: {excel_file_path}")
    print("      Run: venv\\Scripts\\python.exe create_template.py")

# Test 4: Test Create Exam Command
print("\n🚀 Test 4: Testing Create Exam Command...")
if os.path.exists(excel_file_path) and admin_user and levels.exists():
    try:
        # Read file
        with open(excel_file_path, 'rb') as f:
            file_content = f.read()
        
        # Create uploaded file object
        uploaded_file = SimpleUploadedFile(
            name='test_questions.xlsx',
            content=file_content,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        
        # Prepare exam data
        exam_data = {
            'title': 'Test Mathematics Exam',
            'code': f'TEST_MATH_{ExamModule.objects.count() + 1}',
            'level_id': levels.first().id,
            'description': 'Automated test exam',
            'duration_minutes': 60,
            'passing_score': 60,
            'max_attempts': 1,
            'randomize_questions': True,
            'show_correct_answers': True,
            'is_active': False
        }
        
        print("   📝 Creating exam with data:")
        print(f"      Title: {exam_data['title']}")
        print(f"      Code: {exam_data['code']}")
        print(f"      Level: {levels.first().name}")
        
        # Execute command
        command = CreateExamCommand(
            data=exam_data,
            file=uploaded_file,
            user=admin_user
        )
        result = command.execute()
        
        if result.success:
            print(f"   ✅ SUCCESS! {result.message}")
            print(f"\n   📊 Exam Details:")
            exam_info = result.data['exam_module']
            print(f"      ID: {exam_info['id']}")
            print(f"      Title: {exam_info['title']}")
            print(f"      Code: {exam_info['code']}")
            print(f"      Questions: {exam_info['total_questions']}")
            print(f"      Total Marks: {exam_info['total_marks']}")
            
            upload_info = result.data['bulk_upload']
            print(f"\n   📈 Upload Stats:")
            print(f"      Total Records: {upload_info['total_records']}")
            print(f"      Successful: {upload_info['successful_records']}")
            print(f"      Failed: {upload_info['failed_records']}")
            print(f"      Status: {upload_info['status']}")
        else:
            print(f"   ❌ FAILED: {result.message}")
            if hasattr(result, 'data') and result.data:
                print(f"      Details: {result.data}")
    except Exception as e:
        print(f"   ❌ Error during test: {str(e)}")
        import traceback
        traceback.print_exc()
else:
    print("   ⚠️  Prerequisites not met. Skipping test.")

# Test 5: Database Summary
print("\n📊 Test 5: Database Summary...")
exam_count = ExamModule.objects.count()
question_count = Question.objects.count()
print(f"   Total Exams: {exam_count}")
print(f"   Total Questions: {question_count}")

print("\n" + "=" * 70)
print("✅ TESTING COMPLETE")
print("=" * 70)
print("\n🌐 Next Steps:")
print("   1. Ensure Django server is running:")
print("      cd exam_backend")
print("      venv\\Scripts\\python.exe manage.py runserver")
print("\n   2. Open frontend with Live Server (port 5501)")
print("\n   3. Login as admin:")
print(f"      Username: {admin_user.username if admin_user else 'admin'}")
print("      Password: admin123")
print("\n   4. Navigate to Create Exam page")
print("\n   5. Upload exam_question_template.xlsx")
print("\n📖 See TESTING_GUIDE.md for detailed instructions")
