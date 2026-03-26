# Exam Question Upload Template Guide

## Overview
This guide explains how to create Excel or CSV files for bulk question upload in the SmartExam system.

## File Format Requirements

### Supported File Types
- Excel: `.xlsx`, `.xls`
- CSV: `.csv`

### Maximum File Size
- 5 MB

---

## Required Columns

The following columns are **REQUIRED** in your upload file:

| Column Name | Description | Example | Valid Values |
|------------|-------------|---------|--------------|
| `question_text` | The question text | "What is the capital of France?" | Any text |
| `option_a` | First answer option | "London" | Any text |
| `option_b` | Second answer option | "Berlin" | Any text |
| `option_c` | Third answer option | "Paris" | Any text |
| `option_d` | Fourth answer option | "Madrid" | Any text |
| `correct_answer` | The correct answer | "C" | A, B, C, or D (case-insensitive) |

---

## Optional Columns

These columns are optional but recommended:

| Column Name | Description | Default Value | Valid Values |
|------------|-------------|---------------|--------------|
| `difficulty` | Question difficulty level | "medium" | easy, medium, hard |
| `category` | Question category/topic | "General" | Any text |
| `marks` | Points for this question | 1 | Positive integer |
| `explanation` | Explanation of correct answer | None | Any text |
| `order` | Display order | 0 | Integer (0 for auto-order) |

---

## Sample Excel/CSV Structure

### Example 1: Basic Template (Required columns only)

```csv
question_text,option_a,option_b,option_c,option_d,correct_answer
"What is the capital of France?","London","Berlin","Paris","Madrid","C"
"Which programming language is used for web development?","Python","Java","JavaScript","C++","C"
"What is 2 + 2?","3","4","5","6","B"
```

### Example 2: Full Template (With optional columns)

```csv
question_text,option_a,option_b,option_c,option_d,correct_answer,difficulty,category,marks,explanation,order
"What is the capital of France?","London","Berlin","Paris","Madrid","C","easy","Geography",1,"Paris is the capital and largest city of France",1
"Which programming language is used for web development?","Python","Java","JavaScript","C++","C","medium","Programming",2,"JavaScript is primarily used for web development",2
"What is 2 + 2?","3","4","5","6","B","easy","Mathematics",1,"2 + 2 equals 4",3
"Which planet is known as the Red Planet?","Earth","Mars","Jupiter","Venus","B","easy","Science",1,"Mars appears red due to iron oxide on its surface",4
"What does HTML stand for?","Hyper Text Markup Language","High Tech Modern Language","Hyper Transfer Markup Language","Home Tool Markup Language","A","medium","Web Development",2,"HTML stands for Hyper Text Markup Language",5
```

---

## Column Guidelines

### Question Text (`question_text`)
- Write clear, concise questions
- Use proper grammar and punctuation
- Avoid ambiguous wording
- Keep questions focused on one concept

### Options (`option_a`, `option_b`, `option_c`, `option_d`)
- All four options are required
- Make options distinct from each other
- Keep similar length when possible
- Avoid "All of the above" or "None of the above" when possible

### Correct Answer (`correct_answer`)
- Must be exactly A, B, C, or D
- Case-insensitive (a, A, b, B, etc. are all valid)
- Only one correct answer per question

### Difficulty (`difficulty`)
- **easy**: Basic recall or simple concepts
- **medium**: Application of knowledge
- **hard**: Complex analysis or synthesis

### Category (`category`)
- Use consistent naming across questions
- Examples: "Mathematics", "Science", "History", "Programming"
- Helps with question organization and filtering

### Marks (`marks`)
- Must be a positive integer
- Typically 1-5 marks per question
- Higher marks for more difficult questions

### Explanation (`explanation`)
- Brief explanation of why the answer is correct
- Helps students learn from mistakes
- Optional but highly recommended

### Order (`order`)
- Use 0 for automatic ordering
- Use specific numbers (1, 2, 3...) to control question sequence
- Questions will be displayed in ascending order

---

## Best Practices

### 1. File Preparation
✅ **DO:**
- Use UTF-8 encoding for special characters
- Test with a small sample first (5-10 questions)
- Keep backups of your source files
- Use consistent formatting throughout

❌ **DON'T:**
- Mix different question formats in one file
- Use special characters in column names
- Leave required fields empty
- Use merged cells in Excel

### 2. Question Writing
✅ **DO:**
- Write clear, unambiguous questions
- Make all options plausible
- Vary difficulty levels
- Include explanations for complex topics

❌ **DON'T:**
- Use trick questions
- Make one option obviously wrong
- Write overly long questions (>500 characters)
- Include multiple correct answers

### 3. Validation
Before uploading:
- ✓ Check all required columns are present
- ✓ Verify correct_answer column uses only A, B, C, D
- ✓ Ensure no empty required fields
- ✓ Confirm file size is under 5 MB
- ✓ Test with a sample upload

---

## Common Errors and Solutions

### Error: "Missing required columns"
**Cause:** One or more required columns are missing or misspelled  
**Solution:** Check column names match exactly (case-insensitive, spaces allowed)

### Error: "Correct answer must be A, B, C, or D"
**Cause:** correct_answer column contains invalid value  
**Solution:** Ensure all values are A, B, C, or D (case-insensitive)

### Error: "Question text is required"
**Cause:** Empty question_text field  
**Solution:** Fill in all question_text cells

### Error: "Option X is required"
**Cause:** Missing option text for one of the four options  
**Solution:** Ensure all four options (A, B, C, D) have text

### Error: "File size must not exceed 5MB"
**Cause:** Upload file is too large  
**Solution:** Split into multiple files or reduce file size

---

## Download Sample Templates

### Basic Template (CSV)
Create a CSV file with these headers:
```
question_text,option_a,option_b,option_c,option_d,correct_answer
```

### Full Template (Excel)
Create an Excel file with these headers:
```
question_text | option_a | option_b | option_c | option_d | correct_answer | difficulty | category | marks | explanation | order
```

---

## Upload Process

1. **Prepare Your File**
   - Create Excel or CSV file following the template
   - Fill in all required columns
   - Add optional columns as needed

2. **Access Create Exam Page**
   - Log in to admin portal
   - Navigate to "Create Exam"

3. **Fill Exam Details**
   - Enter exam title (e.g., "Mathematics Grade 10")
   - Enter unique exam code (e.g., "MATH101")
   - Select academic level
   - Set duration, passing score, and attempts
   - Configure exam options

4. **Upload File**
   - Click "Browse Files" or drag & drop
   - Select your prepared Excel/CSV file
   - Click "Preview Questions"

5. **Review and Submit**
   - Review question count and any warnings
   - Click "Confirm & Create Exam"
   - Wait for processing confirmation

---

## Example Files

### Simple Math Quiz (5 questions)
```csv
question_text,option_a,option_b,option_c,option_d,correct_answer,difficulty,category,marks
"What is 5 + 3?","6","7","8","9","C","easy","Arithmetic",1
"What is 12 ÷ 4?","2","3","4","5","B","easy","Division",1
"What is 7 × 8?","48","54","56","64","C","medium","Multiplication",1
"What is the square root of 144?","10","11","12","13","C","medium","Roots",2
"Solve: 2x + 5 = 15","x = 5","x = 7.5","x = 10","x = 20","A","hard","Algebra",2
```

### Geography Quiz (3 questions)
```csv
question_text,option_a,option_b,option_c,option_d,correct_answer,difficulty,category,marks,explanation
"What is the capital of Japan?","Beijing","Seoul","Tokyo","Bangkok","C","easy","World Capitals",1,"Tokyo is the capital of Japan"
"Which is the largest ocean?","Atlantic","Pacific","Indian","Arctic","B","easy","Oceans",1,"The Pacific Ocean is the largest"
"What is the tallest mountain?","K2","Kilimanjaro","Mount Everest","Denali","C","medium","Mountains",2,"Mount Everest is 8,848 meters tall"
```

---

## Tips for Success

1. **Start Small**: Upload 10-20 questions first to test the process
2. **Be Consistent**: Use the same format for all questions
3. **Use Categories**: Organize questions by topic for easier management
4. **Add Explanations**: Help students learn from their mistakes
5. **Test Questions**: Have someone review questions for clarity
6. **Keep Records**: Save your source files for future reference

---

## Support

If you encounter issues:
1. Check this documentation first
2. Verify your file format matches the template
3. Test with sample data
4. Contact system administrator if problems persist

---

**Last Updated**: November 2024  
**Version**: 1.0
