# Here's the Python Code for Performing calculations,
# This program calculates how much data you can use per day until expiry.
# if you wish to use it

from datetime import datetime

try:
    # Get total data in GB
    total_data = float(input("Enter total Internet Data (in GB): "))
    if total_data <= 0:
        raise ValueError("Total data must be positive!")  # Ensure data is positive

    # Get expiry date input
    end_date_str = input("Enter expiry date (YYYY-MM-DD): ")
    end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()  # Convert string to date

    # Get today’s date
    today = datetime.today().date()

    # Calculate remaining days
    remaining_days = (end_date - today).days

    # Display results based on the remaining days
    if remaining_days <= 0:
        print("\nThe expiry date has already passed or it is today!")
    else:
        data_per_day = total_data / remaining_days
        print(f"\nRemaining days: {remaining_days} days")
        print(f"You can use approximately {data_per_day:.2f} GB per day.")

except ValueError as e:
    print(f"\nInvalid input: {e}")


# Thank you for using this code
# Alif
