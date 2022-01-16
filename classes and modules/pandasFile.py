import pandas as pd

d = {'col1': [1, 2, 3, 4, 7], 'col2': [4, 5, 6, 9, 5], 'col3': [7, 8, 12, 1, 11]}

df = pd.DataFrame(data=d)

print(df)

print("counting the number of columns using df.shape[1]")

count_column = df.shape[1]
print(f"there are { count_column } columns")

print("counting the number of rows using df.shape[0]")
count_row = df.shape[0]
print(f"there are { count_row } rows")

# Data Science Functions
print("using the max() function")
Average_pulse_max = max(80, 85, 90, 95, 100, 105, 110, 115, 120, 125)

print (f"the maximum pulse is { Average_pulse_max }")

print("using the min() function")
Average_pulse_min = min(80, 85, 90, 95, 100, 105, 110, 115, 120, 125)

print (f"the minimum pulse is { Average_pulse_min }")

print("---------Extracting and Reading Data With Pandas--------------")
health_data = pd.read_csv("data.csv", header=0, sep=",")

print(health_data)
# If you have a large CSV file, you can use the head() function to only show the top 5rows: