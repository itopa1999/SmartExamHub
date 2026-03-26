"""
Script to create Excel template for exam question upload
"""
import pandas as pd
import openpyxl

# Sample data with all columns
data = {
    'question_text': [
        'What is the capital of France?',
        'Which programming language is used for web development?',
        'What is 2 + 2?',
        'Which planet is known as the Red Planet?',
        'What does HTML stand for?'
    ],
    'option_a': [
        'London',
        'Python',
        '3',
        'Earth',
        'Hyper Text Markup Language'
    ],
    'option_b': [
        'Berlin',
        'Java',
        '4',
        'Mars',
        'High Tech Modern Language'
    ],
    'option_c': [
        'Paris',
        'JavaScript',
        '5',
        'Jupiter',
        'Hyper Transfer Markup Language'
    ],
    'option_d': [
        'Madrid',
        'C++',
        '6',
        'Venus',
        'Home Tool Markup Language'
    ],
    'correct_answer': ['C', 'C', 'B', 'B', 'A'],
    'difficulty': ['easy', 'medium', 'easy', 'easy', 'medium'],
    'category': ['Geography', 'Programming', 'Mathematics', 'Science', 'Web Development'],
    'marks': [1, 2, 1, 1, 2],
    'explanation': [
        'Paris is the capital and largest city of France',
        'JavaScript is primarily used for web development',
        '2 + 2 equals 4',
        'Mars appears red due to iron oxide on its surface',
        'HTML stands for Hyper Text Markup Language'
    ],
    'order': [1, 2, 3, 4, 5]
}

# Create DataFrame
df = pd.DataFrame(data)

# Save to Excel
output_file = 'exam_question_template.xlsx'
df.to_excel(output_file, index=False, engine='openpyxl')

print(f'✅ Excel template created successfully: {output_file}')
print(f'📊 Template contains {len(df)} sample questions')
print('\nColumns included:')
for col in df.columns:
    print(f'  - {col}')
