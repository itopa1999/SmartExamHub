"""
Edit Exam Command - SmartExam System
======================================

This module handles exam editing and bulk question updates.

Features:
- Update exam details
- Add questions via bulk upload
- Replace existing questions
- Delete and re-upload questions
"""

import pandas as pd
from io import BytesIO
from django.db import transaction
from utils.base_result import BaseResult
from apps.core.models import ExamModule, Question, Level, BulkUpload
import traceback


class EditExamCommand:
    """
    Command to edit exam and update questions
    """
    
    def __init__(self, exam_id, data, file=None, user=None, mode='update'):
        """
        Initialize command
        
        Args:
            exam_id (int): ID of exam to edit
            data (dict): Updated exam details
            file (File): Optional - New questions file
            user (User): Admin user editing the exam
            mode (str): 'update' (keep existing + add new) or 'replace' (delete all + add new)
        """
        self.exam_id = exam_id
        self.data = data
        self.file = file
        self.user = user
        self.mode = mode
        self.result = BaseResult()
        self.questions_data = []
        self.errors = []
    
    def execute(self):
        """
        Main execution method
        
        Returns:
            BaseResult: Contains updated exam_module info
        """
        try:
            print(f"[DEBUG] Editing exam ID: {self.exam_id}, mode: {self.mode}")
            
            # Get existing exam
            try:
                exam_module = ExamModule.objects.get(id=self.exam_id)
            except ExamModule.DoesNotExist:
                self.result.success = False
                self.result.message = "Exam not found"
                self.result.status_code = 404
                return self.result
            
            with transaction.atomic():
                # Update exam details
                self._update_exam_module(exam_module)
                
                # If file is provided, handle questions
                if self.file:
                    # Parse file
                    if not self._parse_file():
                        return self.result
                    
                    # Validate questions
                    if not self._validate_questions():
                        return self.result
                    
                    # Handle questions based on mode
                    if self.mode == 'replace':
                        # Delete existing questions
                        deleted_count = exam_module.questions.all().delete()[0]
                        print(f"[DEBUG] Deleted {deleted_count} existing questions")
                    
                    # Add new questions
                    questions = self._create_questions(exam_module)
                    print(f"[DEBUG] Added {len(questions)} new questions")
                    
                    # Create bulk upload record
                    bulk_upload = self._create_bulk_upload_record(exam_module, len(questions))
                else:
                    questions = list(exam_module.questions.all())
                
                self.result.success = True
                self.result.message = f"Exam '{exam_module.title}' updated successfully"
                self.result.data = {
                    'exam_module': {
                        'id': exam_module.id,
                        'title': exam_module.title,
                        'code': exam_module.code,
                        'total_questions': exam_module.total_questions,
                        'total_marks': exam_module.total_marks,
                    },
                    'questions_count': len(questions)
                }
                
        except Exception as e:
            print(f"[ERROR] Exception in edit execute: {str(e)}")
            traceback.print_exc()
            self.result.success = False
            self.result.message = f"Error editing exam: {str(e)}"
            self.result.status_code = 500
        
        return self.result
    
    def _update_exam_module(self, exam_module):
        """Update exam module fields"""
        if 'title' in self.data:
            exam_module.title = self.data['title']
        if 'description' in self.data:
            exam_module.description = self.data['description']
        if 'level_id' in self.data:
            exam_module.level = Level.objects.get(id=self.data['level_id'])
        if 'duration_minutes' in self.data:
            exam_module.duration_minutes = self.data['duration_minutes']
        if 'passing_score' in self.data:
            exam_module.passing_score = self.data['passing_score']
        if 'max_attempts' in self.data:
            exam_module.max_attempts = self.data['max_attempts']
        if 'randomize_questions' in self.data:
            exam_module.randomize_questions = self.data['randomize_questions']
        if 'show_correct_answers' in self.data:
            exam_module.show_correct_answers = self.data['show_correct_answers']
        if 'is_active' in self.data:
            exam_module.is_active = self.data['is_active']
        
        exam_module.save()
        print(f"[DEBUG] Updated exam module: {exam_module.code}")
    
    def _parse_file(self):
        """Parse uploaded file (same as create_exam)"""
        try:
            file_name = self.file.name.lower()
            print(f"[DEBUG] Parsing file: {file_name}")
            
            file_content = self.file.read()
            file_io = BytesIO(file_content)
            
            if file_name.endswith('.csv'):
                df = pd.read_csv(file_io)
            elif file_name.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(file_io, engine='openpyxl')
            else:
                self.result.success = False
                self.result.message = "Unsupported file format"
                self.result.status_code = 400
                return False
            
            if df.empty:
                self.result.success = False
                self.result.message = "The uploaded file is empty"
                self.result.status_code = 400
                return False
            
            df.columns = df.columns.str.lower().str.strip().str.replace(' ', '_')
            
            required_columns = ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                self.result.success = False
                self.result.message = f"Missing required columns: {', '.join(missing_columns)}"
                self.result.status_code = 400
                return False
            
            self.questions_data = df.fillna('').to_dict('records')
            return True
            
        except Exception as e:
            print(f"[ERROR] File parsing exception: {str(e)}")
            traceback.print_exc()
            self.result.success = False
            self.result.message = f"Error parsing file: {str(e)}"
            self.result.status_code = 400
            return False
    
    def _validate_questions(self):
        """Validate questions (same logic as create_exam)"""
        if not self.questions_data:
            self.result.success = False
            self.result.message = "No questions found in the uploaded file"
            self.result.status_code = 400
            return False
        
        valid_questions = []
        
        for idx, question in enumerate(self.questions_data, start=1):
            errors_for_row = []
            
            if not str(question.get('question_text', '')).strip():
                errors_for_row.append(f"Row {idx}: Question text is required")
            
            for opt in ['option_a', 'option_b', 'option_c', 'option_d']:
                if not str(question.get(opt, '')).strip():
                    errors_for_row.append(f"Row {idx}: {opt.replace('_', ' ').title()} is required")
            
            correct_answer = str(question.get('correct_answer', '')).upper().strip()
            if correct_answer not in ['A', 'B', 'C', 'D']:
                errors_for_row.append(f"Row {idx}: Correct answer must be A, B, C, or D")
            
            if errors_for_row:
                self.errors.extend(errors_for_row)
                continue
            
            question['difficulty'] = str(question.get('difficulty', 'medium')).lower().strip()
            if question['difficulty'] not in ['easy', 'medium', 'hard']:
                question['difficulty'] = 'medium'
            
            question['category'] = str(question.get('category', 'General')).strip() or 'General'
            
            try:
                question['marks'] = int(float(question.get('marks', 1))) if question.get('marks') else 1
            except:
                question['marks'] = 1
            
            question['explanation'] = str(question.get('explanation', '')).strip() or None
            
            try:
                question['order'] = int(float(question.get('order', 0))) if question.get('order') else 0
            except:
                question['order'] = 0
            
            question['correct_answer'] = correct_answer
            valid_questions.append(question)
        
        if not valid_questions:
            self.result.success = False
            self.result.message = "No valid questions found"
            self.result.data = {'errors': self.errors}
            self.result.status_code = 400
            return False
        
        self.questions_data = valid_questions
        return True
    
    def _create_questions(self, exam_module):
        """Create Question instances in bulk"""
        questions = []
        
        for question_data in self.questions_data:
            question = Question(
                exam_module=exam_module,
                question_text=question_data['question_text'],
                option_a=question_data['option_a'],
                option_b=question_data['option_b'],
                option_c=question_data['option_c'],
                option_d=question_data['option_d'],
                correct_answer=question_data['correct_answer'],
                difficulty=question_data['difficulty'],
                category=question_data['category'],
                marks=question_data['marks'],
                explanation=question_data.get('explanation'),
                order=question_data.get('order', 0),
                is_active=True
            )
            questions.append(question)
        
        created_questions = Question.objects.bulk_create(questions)
        return created_questions
    
    def _create_bulk_upload_record(self, exam_module, questions_count):
        """Create BulkUpload tracking record"""
        bulk_upload = BulkUpload.objects.create(
            upload_type='questions',
            file=self.file,
            uploaded_by=self.user,
            total_records=len(self.questions_data) + len(self.errors),
            successful_records=questions_count,
            failed_records=len(self.errors),
            status='completed',
            error_log='\n'.join(self.errors) if self.errors else None
        )
        return bulk_upload
