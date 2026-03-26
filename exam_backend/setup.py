#!/usr/bin/env python
import os
import django
from getpass import getpass

# ------------------------------
# Django setup
# ------------------------------
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth.models import User, Group

# ------------------------------
# Fancy CLI helpers
# ------------------------------
def print_banner():
    print("\n" + "="*50)
    print("🔥 Welcome to SmartExams Admin User Creator 🔥".center(50))
    print("="*50 + "\n")

def print_success(msg):
    print(f"\033[92m✔ {msg}\033[0m")  # green text

def print_error(msg):
    print(f"\033[91m✖ {msg}\033[0m")  # red text

def print_info(msg):
    print(f"\033[94mℹ {msg}\033[0m")  # blue text

# ------------------------------
# Main script
# ------------------------------
def main():
    print_banner()
    print_info("Let's create a new admin user for your SmartExams portal!\n")

    username = input("Enter Username: ").strip()
    email = input("Enter Email: ").strip()
    password = getpass("Enter Password: ").strip()
    first_name = input("Enter First Name: ").strip()
    last_name = input("Enter Last Name: ").strip()

    if User.objects.filter(username=username).exists():
        print_error(f"User '{username}' already exists!")
        return

    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=first_name,
        last_name=last_name,
        email=email,
        is_staff=True,        # access to admin
        is_superuser=False    # set True if you want full superuser rights
    )

    # Add user to admin group
    group, created = Group.objects.get_or_create(name="admin")
    user.groups.add(group)

    print_success(f"User '{username}' created successfully and added to 'admin' group!\n")
    print_info("You can now login to the admin portal using this account.")

if __name__ == "__main__":
    main()