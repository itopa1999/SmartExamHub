"""
Create sample academic levels for testing
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apps.core.models import Level

# Create levels
levels_data = [
    {"name": "Grade 8", "level_type": "secondary", "code": "SEC08", "description": "Secondary School - Grade 8"},
    {"name": "Grade 9", "level_type": "secondary", "code": "SEC09", "description": "Secondary School - Grade 9"},
    {"name": "Grade 10", "level_type": "secondary", "code": "SEC10", "description": "Secondary School - Grade 10"},
    {"name": "Grade 11", "level_type": "secondary", "code": "SEC11", "description": "Secondary School - Grade 11"},
    {"name": "Grade 12", "level_type": "secondary", "code": "SEC12", "description": "Secondary School - Grade 12"},
    {"name": "Year 1", "level_type": "tertiary", "code": "TER01", "description": "University - Year 1"},
    {"name": "Year 2", "level_type": "tertiary", "code": "TER02", "description": "University - Year 2"},
    {"name": "Year 3", "level_type": "tertiary", "code": "TER03", "description": "University - Year 3"},
]

created_count = 0
existing_count = 0

for level_data in levels_data:
    level, created = Level.objects.get_or_create(
        code=level_data['code'],
        defaults={
            'name': level_data['name'],
            'level_type': level_data['level_type'],
            'description': level_data.get('description', ''),
            'is_active': True
        }
    )
    if created:
        created_count += 1
        print(f"✅ Created: {level.name} ({level.code})")
    else:
        existing_count += 1
        print(f"ℹ️  Already exists: {level.name} ({level.code})")

print(f"\n📊 Summary:")
print(f"   Created: {created_count}")
print(f"   Already existing: {existing_count}")
print(f"   Total: {Level.objects.filter(is_active=True).count()} active levels")
