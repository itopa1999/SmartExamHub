"""
Create Exam Command - SmartExam System
========================================

This module handles exam creation with bulk question upload from Excel/CSV files.

Features:
- Parse Excel (.xlsx, .xls) and CSV files
- Validate question data
- Create ExamModule and Questions in bulk
- Track upload history
- Provide detailed error reporting
"""

import pandas as pd
from io import BytesIO
from django.db import transaction
from utils.base_result import BaseResult
from apps.core.models import ExamModule, Question, Level, BulkUpload
import traceback


class CreateExamCommand:
    """
    Command to create exam with questions from uploaded file
    """
    
    def __init__(self, data, file, user):
        """
        Initialize command with exam data and uploaded file
        
        Args:
            data (dict): Exam details (title, code, level_id, etc.)
            file (File): Uploaded Excel/CSV file
            user (User): Admin user creating the exam
        """
        self.data = data
        self.file = file
        self.user = user
        self.result = BaseResult()
        self.questions_data = []
        self.errors = []
    
    def execute(self):
        """
        Main execution method
        
        Returns:
            BaseResult: Contains exam_module, questions, and upload tracking info
        """
        try:
            print(f"[DEBUG] Starting exam creation: {self.data.get('title')}")
            
            # Step 1: Parse the file
            if not self._parse_file():
                print(f"[ERROR] File parsing failed: {self.result.message}")
                return self.result
            
            print(f"[DEBUG] Successfully parsed {len(self.questions_data)} questions")
            
            # Step 2: Validate questions data
            if not self._validate_questions():
                print(f"[ERROR] Question validation failed: {self.result.message}")
                return self.result
            
            print(f"[DEBUG] Validated {len(self.questions_data)} valid questions")
            
            # Step 3: Create exam and questions in transaction
            with transaction.atomic():
                # Create exam module
                exam_module = self._create_exam_module()
                if not exam_module:
                    print(f"[ERROR] Exam module creation failed")
                    return self.result
                
                print(f"[DEBUG] Created exam module: {exam_module.code}")
                
                # Create questions
                questions = self._create_questions(exam_module)
                print(f"[DEBUG] Created {len(questions)} questions")
                
                # Create bulk upload record
                bulk_upload = self._create_bulk_upload_record(
                    exam_module, 
                    len(questions)
                )
                
                self.result.success = True
                self.result.message = f"Exam '{exam_module.title}' created successfully with {len(questions)} questions"
                self.result.data = {
                    'exam_module': {
                        'id': exam_module.id,
                        'title': exam_module.title,
                        'code': exam_module.code,
                        'total_questions': len(questions),
                        'total_marks': exam_module.total_marks,
                    },
                    'questions': [
                        {
                            'id': q.id,
                            'question_text': q.question_text,
                            'difficulty': q.difficulty,
                            'category': q.category,
                            'marks': q.marks,
                        }
                        for q in questions
                    ],
                    'bulk_upload': {
                        'id': bulk_upload.id,
                        'total_records': bulk_upload.total_records,
                        'successful_records': bulk_upload.successful_records,
                        'failed_records': bulk_upload.failed_records,
                        'status': bulk_upload.status,
                    }
                }
                
        except Exception as e:
            print(f"[ERROR] Exception in execute: {str(e)}")
            traceback.print_exc()
            self.result.success = False
            self.result.message = f"Error creating exam: {str(e)}"
            self.result.status_code = 500
        
        return self.result
    
    
    def _parse_file(self):
        """
        Parse Excel or CSV file and extract questions data
        
        Returns:
            bool: True if parsing successful, False otherwise
        """
        try:
            file_name = self.file.name.lower()
            print(f"[DEBUG] Parsing file: {file_name}")
            
            # Read file content into BytesIO
            file_content = self.file.read()
            file_io = BytesIO(file_content)
            
            # Read file based on extension
            if file_name.endswith('.csv'):
                df = pd.read_csv(file_io)
                print(f"[DEBUG] CSV file loaded, shape: {df.shape}")
            elif file_name.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(file_io, engine='openpyxl')
                print(f"[DEBUG] Excel file loaded, shape: {df.shape}")
            else:
                self.result.success = False
                self.result.message = "Unsupported file format. Please upload Excel (.xlsx, .xls) or CSV (.csv) file"
                self.result.status_code = 400
                return False
            
            # Check if dataframe is empty
            if df.empty:
                self.result.success = False
                self.result.message = "The uploaded file is empty"
                self.result.status_code = 400
                return False
            
            print(f"[DEBUG] Original columns: {df.columns.tolist()}")
            
            # Standardize column names (lowercase and strip spaces, replace spaces with underscores)
            df.columns = df.columns.str.lower().str.strip().str.replace(' ', '_')
            print(f"[DEBUG] Normalized columns: {df.columns.tolist()}")
            
            # Check required columns
            required_columns = [
                'question_text', 'option_a', 'option_b', 'option_c', 
                'option_d', 'correct_answer'
            ]
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                self.result.success = False
                self.result.message = f"Missing required columns: {', '.join(missing_columns)}. Found columns: {', '.join(df.columns.tolist())}"
                self.result.status_code = 400
                return False
            
            # Convert dataframe to list of dictionaries, replacing NaN with empty strings
            self.questions_data = df.fillna('').to_dict('records')
            print(f"[DEBUG] Extracted {len(self.questions_data)} rows from file")
            
            return True
            
        except Exception as e:
            print(f"[ERROR] File parsing exception: {str(e)}")
            traceback.print_exc()
            self.result.success = False
            self.result.message = f"Error parsing file: {str(e)}"
            self.result.status_code = 400
            return False
    
    
    def _validate_questions(self):
        """
        Validate all questions data
        
        Returns:
            bool: True if all questions are valid, False otherwise
        """
        if not self.questions_data:
            self.result.success = False
            self.result.message = "No questions found in the uploaded file"
            self.result.status_code = 400
            return False
        
        valid_questions = []
        
        for idx, question in enumerate(self.questions_data, start=1):
            errors_for_row = []
            
            # Validate required fields
            if not str(question.get('question_text', '')).strip():
                errors_for_row.append(f"Row {idx}: Question text is required")
            
            # Validate options
            for opt in ['option_a', 'option_b', 'option_c', 'option_d']:
                if not str(question.get(opt, '')).strip():
                    errors_for_row.append(f"Row {idx}: {opt.replace('_', ' ').title()} is required")
            
            # Validate correct answer
            correct_answer = str(question.get('correct_answer', '')).upper().strip()
            if correct_answer not in ['A', 'B', 'C', 'D']:
                errors_for_row.append(f"Row {idx}: Correct answer must be A, B, C, or D (found: '{correct_answer}')")
            
            # If there are errors for this row, add them and skip
            if errors_for_row:
                self.errors.extend(errors_for_row)
                continue
            
            # Set defaults for optional fields
            question['difficulty'] = str(question.get('difficulty', 'medium')).lower().strip()
            if question['difficulty'] not in ['easy', 'medium', 'hard']:
                question['difficulty'] = 'medium'
            
            question['category'] = str(question.get('category', 'General')).strip() or 'General'
            
            # Handle marks
            try:
                marks_value = question.get('marks', 1)
                question['marks'] = int(float(marks_value)) if marks_value else 1
            except:
                question['marks'] = 1
            
            question['explanation'] = str(question.get('explanation', '')).strip() or None
            
            # Handle order
            try:
                order_value = question.get('order', 0)
                question['order'] = int(float(order_value)) if order_value else 0
            except:
                question['order'] = 0
            
            # Ensure correct_answer is uppercase
            question['correct_answer'] = correct_answer
            
            valid_questions.append(question)
        
        # Check if we have any valid questions
        if not valid_questions:
            self.result.success = False
            self.result.message = "No valid questions found"
            self.result.data = {'errors': self.errors}
            self.result.status_code = 400
            return False
        
        # Update questions data with only valid questions
        self.questions_data = valid_questions
        
        # Include warnings if some questions were skipped
        if self.errors:
            print(f"[WARNING] {len(self.errors)} validation errors found")
            for error in self.errors:
                print(f"  - {error}")
            self.result.data = {
                'warnings': self.errors,
                'valid_questions': len(valid_questions),
                'invalid_questions': len(self.errors)
            }
        
        return True
    
    def _create_exam_module(self):
        """
        Create ExamModule instance
        
        Returns:
            ExamModule: Created exam module instance
        """
        try:
            level = Level.objects.get(id=self.data['level_id'], is_active=True)
            
            exam_module = ExamModule.objects.create(
                title=self.data['title'],
                description=self.data.get('description', ''),
                code=self.data['code'],
                level=level,
                duration_minutes=self.data.get('duration_minutes', 60),
                passing_score=self.data.get('passing_score', 60),
                max_attempts=self.data.get('max_attempts', 1),
                randomize_questions=self.data.get('randomize_questions', True),
                show_correct_answers=self.data.get('show_correct_answers', True),
                is_active=self.data.get('is_active', False),
            )
            
            return exam_module
            
        except Level.DoesNotExist:
            self.result.success = False
            self.result.message = "Invalid level ID"
            self.result.status_code = 400
            return None
        except Exception as e:
            self.result.success = False
            self.result.message = f"Error creating exam module: {str(e)}"
            self.result.status_code = 500
            return None
    
    def _create_questions(self, exam_module):
        """
        Create Question instances in bulk
        
        Args:
            exam_module (ExamModule): Exam module to associate questions with
        
        Returns:
            list: List of created Question instances
        """
        questions = []
        
        for question_data in self.questions_data:
            question = Question(
                exam_module=exam_module,
                question_text=question_data['question_text'],
                option_a=question_data['option_a'],
                option_b=question_data['option_b'],
                option_c=question_data['option_c'],
                option_d=question_data['option_d'],
                correct_answer=str(question_data['correct_answer']).upper().strip(),
                difficulty=question_data['difficulty'],
                category=question_data['category'],
                marks=question_data['marks'],
                explanation=question_data.get('explanation'),
                order=question_data.get('order', 0),
                is_active=True
            )
            questions.append(question)
        
        # Bulk create questions
        created_questions = Question.objects.bulk_create(questions)
        
        return created_questions
    
    def _create_bulk_upload_record(self, exam_module, questions_count):
        """
        Create BulkUpload tracking record
        
        Args:
            exam_module (ExamModule): Created exam module
            questions_count (int): Number of questions created
        
        Returns:
            BulkUpload: Created bulk upload record
        """
        bulk_upload = BulkUpload.objects.create(
            upload_type='questions',
            file=self.file,
            uploaded_by=self.user,
            total_records=len(self.questions_data) + len(self.errors),
            successful_records=questions_count,
            failed_records=len(self.errors),
            status='completed' if not self.errors else 'completed',
            error_log='\n'.join(self.errors) if self.errors else None
        )
        
        return bulk_upload
