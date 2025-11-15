# # ============================================================================
# # QUESTION MANAGEMENT
# # ============================================================================

# class Question(BaseModel):
#     """
#     Question Model
    
#     Stores individual exam questions with multiple choice options.
#     Questions can be added manually or via bulk upload (Excel/CSV).
    
#     Features:
#     - Multiple choice format (4 options: A, B, C, D)
#     - Difficulty levels
#     - Categorization
#     - Mark allocation
#     - Correct answer tracking
#     """
    
#     DIFFICULTY_CHOICES = [
#         ('easy', 'Easy'),
#         ('medium', 'Medium'),
#         ('hard', 'Hard'),
#     ]
    
#     exam_module = models.ForeignKey(
#         ExamModule,
#         on_delete=models.CASCADE,
#         related_name='questions',
#         help_text="Exam this question belongs to"
#     )
#     question_text = models.TextField(
#         help_text="The question text"
#     )
#     option_a = models.CharField(
#         max_length=500,
#         help_text="Option A"
#     )
#     option_b = models.CharField(
#         max_length=500,
#         help_text="Option B"
#     )
#     option_c = models.CharField(
#         max_length=500,
#         help_text="Option C"
#     )
#     option_d = models.CharField(
#         max_length=500,
#         help_text="Option D"
#     )
#     correct_answer = models.CharField(
#         max_length=1,
#         choices=[('A', 'Option A'), ('B', 'Option B'), ('C', 'Option C'), ('D', 'Option D')],
#         help_text="The correct answer option"
#     )
#     difficulty = models.CharField(
#         max_length=10,
#         choices=DIFFICULTY_CHOICES,
#         default='medium',
#         help_text="Question difficulty level"
#     )
#     category = models.CharField(
#         max_length=100,
#         blank=True,
#         null=True,
#         help_text="Question category or topic (optional)"
#     )
#     marks = models.IntegerField(
#         validators=[MinValueValidator(1)],
#         default=1,
#         help_text="Marks allocated to this question"
#     )
#     explanation = models.TextField(
#         blank=True,
#         null=True,
#         help_text="Explanation for the correct answer (optional)"
#     )
#     order = models.IntegerField(
#         default=0,
#         help_text="Display order (0 for default ordering)"
#     )
#     is_active = models.BooleanField(
#         default=True,
#         help_text="Whether this question is active"
#     )
    
#     class Meta:
#         verbose_name = "Question"
#         verbose_name_plural = "Questions"
#         ordering = ['exam_module', 'order', 'created_at']
#         indexes = [
#             models.Index(fields=['exam_module', 'is_active']),
#         ]
    
#     def __str__(self):
#         return f"Q{self.id}: {self.question_text[:50]}..."
    
#     @property
#     def options(self):
#         """Returns all options as a dictionary"""
#         return {
#             'A': self.option_a,
#             'B': self.option_b,
#             'C': self.option_c,
#             'D': self.option_d,
#         }


# # ============================================================================
# # EXAM ATTEMPTS & RESULTS
# # ============================================================================

# class ExamAttempt(BaseModel):
#     """
#     Exam Attempt Model
    
#     Tracks individual student attempts at exams.
#     Records answers, scores, and timing information.
    
#     Features:
#     - Attempt tracking (1st, 2nd, 3rd attempt)
#     - Answer recording
#     - Auto-scoring
#     - Time tracking
#     - Status management
#     """
    
#     STATUS_CHOICES = [
#         ('in_progress', 'In Progress'),
#         ('completed', 'Completed'),
#         ('abandoned', 'Abandoned'),
#     ]
    
#     student = models.ForeignKey(
#         Student,
#         on_delete=models.CASCADE,
#         related_name='exam_attempts',
#         help_text="Student taking the exam"
#     )
#     exam_module = models.ForeignKey(
#         ExamModule,
#         on_delete=models.CASCADE,
#         related_name='exam_attempts',
#         help_text="Exam being attempted"
#     )
#     attempt_number = models.IntegerField(
#         default=1,
#         help_text="Attempt number (1, 2, 3, etc.)"
#     )
#     status = models.CharField(
#         max_length=20,
#         choices=STATUS_CHOICES,
#         default='in_progress',
#         help_text="Current status of the attempt"
#     )
#     start_time = models.DateTimeField(
#         auto_now_add=True,
#         help_text="When the exam was started"
#     )
#     end_time = models.DateTimeField(
#         blank=True,
#         null=True,
#         help_text="When the exam was completed"
#     )
#     time_taken_seconds = models.IntegerField(
#         blank=True,
#         null=True,
#         help_text="Total time taken in seconds"
#     )
#     score = models.DecimalField(
#         max_digits=5,
#         decimal_places=2,
#         blank=True,
#         null=True,
#         help_text="Final score percentage (0-100)"
#     )
#     total_questions = models.IntegerField(
#         default=0,
#         help_text="Total number of questions in the exam"
#     )
#     correct_answers = models.IntegerField(
#         default=0,
#         help_text="Number of correct answers"
#     )
#     wrong_answers = models.IntegerField(
#         default=0,
#         help_text="Number of wrong answers"
#     )
#     unanswered = models.IntegerField(
#         default=0,
#         help_text="Number of unanswered questions"
#     )
#     passed = models.BooleanField(
#         default=False,
#         help_text="Whether the student passed the exam"
#     )
    
#     class Meta:
#         verbose_name = "Exam Attempt"
#         verbose_name_plural = "Exam Attempts"
#         ordering = ['-start_time']
#         unique_together = ['student', 'exam_module', 'attempt_number']
#         indexes = [
#             models.Index(fields=['student', 'exam_module']),
#             models.Index(fields=['status']),
#         ]
    
#     def __str__(self):
#         return f"{self.student.full_name} - {self.exam_module.title} (Attempt {self.attempt_number})"
    
#     @property
#     def grade(self):
#         """Calculate letter grade based on score"""
#         if self.score is None:
#             return 'N/A'
        
#         score = float(self.score)
#         if score >= 90:
#             return 'A+'
#         elif score >= 80:
#             return 'A'
#         elif score >= 70:
#             return 'B'
#         elif score >= 60:
#             return 'C'
#         elif score >= 50:
#             return 'D'
#         else:
#             return 'F'
    
#     def calculate_score(self):
#         """Calculate and update the score based on answers"""
#         answers = self.student_answers.all()
#         total = answers.count()
#         correct = answers.filter(is_correct=True).count()
        
#         self.total_questions = total
#         self.correct_answers = correct
#         self.wrong_answers = total - correct
        
#         if total > 0:
#             self.score = (correct / total) * 100
#             self.passed = self.score >= self.exam_module.passing_score
        
#         self.save()


# class StudentAnswer(BaseModel):
#     """
#     Student Answer Model
    
#     Records individual answers for each question in an exam attempt.
#     Links student responses to questions and tracks correctness.
    
#     Features:
#     - Question-answer linking
#     - Automatic correctness checking
#     - Answer timestamp
#     """
    
#     exam_attempt = models.ForeignKey(
#         ExamAttempt,
#         on_delete=models.CASCADE,
#         related_name='student_answers',
#         help_text="The exam attempt this answer belongs to"
#     )
#     question = models.ForeignKey(
#         Question,
#         on_delete=models.CASCADE,
#         related_name='student_answers',
#         help_text="The question being answered"
#     )
#     selected_answer = models.CharField(
#         max_length=1,
#         choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')],
#         blank=True,
#         null=True,
#         help_text="Student's selected answer"
#     )
#     is_correct = models.BooleanField(
#         default=False,
#         help_text="Whether the answer is correct"
#     )
#     answered_at = models.DateTimeField(
#         auto_now_add=True,
#         help_text="When the answer was submitted"
#     )
    
#     class Meta:
#         verbose_name = "Student Answer"
#         verbose_name_plural = "Student Answers"
#         unique_together = ['exam_attempt', 'question']
#         ordering = ['question__order']
    
#     def __str__(self):
#         return f"{self.exam_attempt.student.full_name} - Q{self.question.id}"
    
#     def save(self, *args, **kwargs):
#         """Override save to automatically check if answer is correct"""
#         if self.selected_answer:
#             self.is_correct = (self.selected_answer == self.question.correct_answer)
#         super().save(*args, **kwargs)
