import requests
import json

BASE_URL = "http://localhost:8001/api"

def test_auth_flow():
    print("--- Starting Auth Flow Test ---")
    
    # 1. Signup
    signup_data = {
        "email": "testuser@example.com",
        "password": "testpassword123",
        "full_name": "Test User"
    }
    print(f"Testing Signup: {signup_data['email']}")
    response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
    if response.status_code == 200:
        print("Signup Successful!")
    elif response.status_code == 400 and "already registered" in response.text:
        print("User already exists (ok for repeat test)")
    else:
        print(f"Signup Failed: {response.status_code} - {response.text}")
        return

    # 2. Login
    login_data = {
        "email": "testuser@example.com",
        "password": "testpassword123"
    }
    print(f"Testing Login: {login_data['email']}")
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code == 200:
        token = response.json().get("access_token")
        print("Login Successful! Received Token.")
    else:
        print(f"Login Failed: {response.status_code} - {response.text}")
        return

    # 3. Get Me
    print("Testing /me endpoint...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    if response.status_code == 200:
        user = response.json()
        print(f"Me endpoint Successful! Logged in as: {user['full_name']} ({user['email']})")
    else:
        print(f"Me endpoint Failed: {response.status_code} - {response.text}")
        return

    print("--- Auth Flow Test Completed Successfully ---")

if __name__ == "__main__":
    try:
        test_auth_flow()
    except Exception as e:
        print(f"Error during testing: {e}")
        print("Make sure the FastAPI server is running at http://localhost:8000")
